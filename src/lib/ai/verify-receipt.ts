import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { createWorker, type Worker } from "tesseract.js";
import type { AiVerdict, RulesVerdict, VerificationSource } from "@/generated/prisma/client";

export type ReceiptCheckInput = {
  receiptImageUrl: string;
  expectedAmount: number;
  orderNo: string;
  method: "KBZPAY" | "BANK" | "COD";
};

export type ReceiptCheckResult = {
  rulesVerdict: RulesVerdict;
  aiVerdict: AiVerdict;
  aiProvider: string;
  confidence: number | null;
  ocrText: string;
  extracted: {
    amountFound: boolean;
    orderNoFound: boolean;
    keywordFound: boolean;
    amountsSeen: number[];
  };
  reasons: string[];
  aiNote: string | null;
};

let workerPromise: Promise<Worker> | null = null;

// Turbopack rewrites `__dirname` inside bundled deps, so tesseract.js's
// default workerPath resolves to a nonexistent location. Resolve the real
// file from the project root instead.
function resolveTesseractWorker(): string {
  const requireFromRoot = createRequire(path.join(process.cwd(), "package.json"));
  return requireFromRoot.resolve("tesseract.js/src/worker-script/node/index.js");
}

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker("eng", 1, {
      workerPath: resolveTesseractWorker(),
    }).catch((err) => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

const PAYMENT_KEYWORDS =
  /(kb\s?z|kbzpay|successful|success|paid|transaction|transfer|completed|received|payment|到账|成功)/i;

function extractAmountTokens(text: string): number[] {
  const tokens = text.match(/\d[\d,\s]*\d|\d/g) ?? [];
  const seen: number[] = [];
  for (const raw of tokens) {
    const t = raw.replace(/\D/g, "");
    if (t.length >= 3 && t.length <= 12) {
      const n = Number(t);
      if (Number.isFinite(n) && n > 0 && !seen.includes(n)) seen.push(n);
    }
  }
  return seen;
}

function amountAppears(text: string, expected: number): { found: boolean; seen: number[] } {
  const digits = String(expected);
  const seen = extractAmountTokens(text);
  const tokens = text.match(/\d[\d,\s]*\d|\d/g) ?? [];
  for (const raw of tokens) {
    const t = raw.replace(/\D/g, "");
    if (!t) continue;
    if (t === digits) return { found: true, seen };
    if (t.length >= 3 && digits.startsWith(t)) return { found: true, seen };
    if (t.length > digits.length && t.slice(0, digits.length) === digits)
      return { found: true, seen };
    if (digits.length >= 4 && t.length >= 4 && digits.endsWith(t))
      return { found: true, seen };
  }
  return { found: false, seen };
}

function resolveLocalPath(receiptImageUrl: string): string | null {
  const match = receiptImageUrl.match(/^\/api\/uploads\/receipts\/([A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp))$/);
  if (!match) return null;
  return path.join(process.cwd(), "uploads", "receipts", match[1]);
}

function parseGeminiJson(raw: string): {
  verdict: AiVerdict;
  confidence: number | null;
  reasons: string[];
} | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      verdict?: string;
      confidence?: number;
      reasons?: string[];
    };
    const verdictMap: Record<string, AiVerdict> = {
      LIKELY_REAL: "LIKELY_REAL",
      SUSPICIOUS: "SUSPICIOUS",
      LIKELY_FAKE: "LIKELY_FAKE",
    };
    const verdict = verdictMap[String(parsed.verdict).toUpperCase()] ?? "SUSPICIOUS";
    const confidence =
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
        : null;
    return {
      verdict,
      confidence,
      reasons: Array.isArray(parsed.reasons)
        ? parsed.reasons.slice(0, 6).map((r) => String(r))
        : [],
    };
  } catch {
    return null;
  }
}

async function geminiCheck(
  ocrText: string,
  input: ReceiptCheckInput
): Promise<{ verdict: AiVerdict; confidence: number | null; reasons: string[]; note: string | null }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      verdict: "SKIPPED",
      confidence: null,
      reasons: [],
      note: "GEMINI_API_KEY not configured — rules-only check.",
    };
  }

  const prompt = [
    "You are verifying a mobile payment screenshot (screenshot of a bank transfer or KBZPay confirmation) for an online store in Myanmar.",
    `Order number: ${input.orderNo}`,
    `Expected amount: ${input.expectedAmount} MMK`,
    `Payment method: ${input.method}`,
    "OCR text extracted from the screenshot:",
    "----",
    ocrText.slice(0, 4000),
    "----",
    "Decide if the screenshot plausibly shows a SUCCESSFUL payment of the expected amount for this order.",
    'Reply with ONLY JSON: {"verdict":"LIKELY_REAL"|"SUSPICIOUS"|"LIKELY_FAKE","confidence":0-100,"reasons":["..."]}',
    "Reasons must be short English strings.",
  ].join("\n");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
        }),
      }
    );
    if (!res.ok) {
      return {
        verdict: "SKIPPED",
        confidence: null,
        reasons: [],
        note: `Gemini API error ${res.status}.`,
      };
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { verdict: "SKIPPED", confidence: null, reasons: [], note: "Gemini returned no text." };
    }
    const parsed = parseGeminiJson(text);
    if (!parsed) {
      return { verdict: "ERROR", confidence: null, reasons: [], note: "Could not parse Gemini response." };
    }
    return {
      verdict: parsed.verdict,
      confidence: parsed.confidence,
      reasons: parsed.reasons,
      note: null,
    };
  } catch (e) {
    return {
      verdict: "SKIPPED",
      confidence: null,
      reasons: [],
      note: `Gemini call failed: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}

export async function verifyReceipt(input: ReceiptCheckInput): Promise<ReceiptCheckResult> {
  const reasons: string[] = [];
  const localPath = resolveLocalPath(input.receiptImageUrl);

  let ocrText = "";
  let ocrFailed = false;
  try {
    if (!localPath) throw new Error("unsupported image path");
    const buffer = await readFile(localPath);
    const worker = await getWorker();
    const result = await worker.recognize(buffer);
    ocrText = result.data.text ?? "";
  } catch (e) {
    ocrFailed = true;
    reasons.push(`OCR failed: ${e instanceof Error ? e.message : "unknown"}`);
  }

  const { found: amountFound, seen: amountsSeen } = amountAppears(ocrText, input.expectedAmount);
  const orderNoFound = ocrText.toUpperCase().includes(input.orderNo.toUpperCase());
  const keywordFound = PAYMENT_KEYWORDS.test(ocrText);

  let rulesVerdict: RulesVerdict;
  if (ocrFailed || ocrText.trim().length < 5) {
    rulesVerdict = "ERROR";
    if (!ocrFailed) reasons.push("OCR text too short to analyze.");
  } else if (amountFound && (orderNoFound || keywordFound)) {
    rulesVerdict = "PASS";
    reasons.push("Amount matched" + (orderNoFound ? " and order number found." : " and payment keyword found."));
  } else if (amountFound) {
    rulesVerdict = "WARN";
    reasons.push("Amount found but no order number or payment keyword detected.");
  } else if (orderNoFound || keywordFound) {
    rulesVerdict = "WARN";
    reasons.push("Payment indicators found but expected amount not detected.");
  } else {
    rulesVerdict = "FAIL";
    reasons.push("Neither the expected amount nor payment indicators were detected.");
  }
  if (amountFound) reasons.push(`Amount present in OCR text.`);
  if (orderNoFound) reasons.push(`Order number ${input.orderNo} present in OCR text.`);

  const ai = ocrFailed
    ? { verdict: "SKIPPED" as AiVerdict, confidence: null, reasons: [], note: "Skipped: OCR failed." }
    : await geminiCheck(ocrText, input);

  reasons.push(...ai.reasons);

  return {
    rulesVerdict,
    aiVerdict: ai.verdict,
    aiProvider: process.env.GEMINI_API_KEY ? "gemini-2.5-flash" : "none",
    confidence: ai.confidence,
    ocrText: ocrText.slice(0, 5000),
    extracted: { amountFound, orderNoFound, keywordFound, amountsSeen: amountsSeen.slice(0, 20) },
    reasons,
    aiNote: ai.note,
  };
}

export function sourceForMethod(method: string): VerificationSource {
  return method === "KBZPAY" ? "KBZ_SS" : "BANK_SS";
}
