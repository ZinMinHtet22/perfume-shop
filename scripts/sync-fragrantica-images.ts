import "dotenv/config";
import { writeFile, mkdir, stat, readFile, rm } from "node:fs/promises";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "../src/lib/prisma";

const execFile = promisify(execFileCb);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const OUT_DIR = path.join(process.cwd(), "public", "images", "products");
const MANIFEST = path.join(OUT_DIR, ".fragrantica-sync.json");
const FORCE = process.env.FORCE === "1";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type PerfumeLink = {
  path: string;
  brandSeg: string;
  name: string;
  id: string;
  order: number;
};

type Manifest = Record<
  string,
  { status: "synced" | "kept-placeholder" | "no-match" | "error"; at: string }
>;

type CurlResult = { code: number; contentType: string; finalUrl: string; body: Buffer };

async function curlGet(url: string): Promise<CurlResult> {
  const tmp = path.join(os.tmpdir(), `frag-${randomUUID()}.tmp`);
  try {
    const { stdout } = await execFile(
      "curl.exe",
      [
        "-s", "-L", "-m", "45", "-A", UA,
        "-o", tmp,
        "-w", "%{http_code}|%{content_type}|%{url_effective}",
        url,
      ],
      { maxBuffer: 64 * 1024 * 1024 }
    );
    const [code, contentType, finalUrl] = stdout.split("|");
    const body = await readFile(tmp).catch(() => Buffer.alloc(0));
    return { code: Number(code), contentType: contentType ?? "", finalUrl: finalUrl ?? url, body };
  } finally {
    await rm(tmp, { force: true });
  }
}

async function curlText(url: string): Promise<{ status: number; text: string; finalUrl: string }> {
  const r = await curlGet(url);
  return { status: r.code, text: r.body.toString("utf8"), finalUrl: r.finalUrl };
}

const CONC = [
  [/\beau\s*de\s*toilette\b/gi, "edt"],
  [/\beau\s*de\s*parfum\b/gi, "edp"],
  [/\bedt\b/gi, "edt"],
  [/\bedp\b/gi, "edp"],
] as const;

function tokens(s: string): string[] {
  let x = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [re, rep] of CONC) x = x.replace(re, ` ${rep} `);
  return x.split(/[^a-z0-9]+/).filter((w) => w.length > 0);
}

function compact(s: string | string[]): string {
  return (typeof s === "string" ? tokens(s) : s).join("");
}

function coreOf(toks: string[]): string[] {
  const drop = new Set(["edt", "edp", "eau", "de", "parfum", "toilette", "cologne", "extrait"]);
  return toks.filter((w) => !drop.has(w));
}

function markerOf(toks: string[]): string {
  const s = toks.join(" ");
  if (/\bedt\b/.test(s) || /toilette/.test(s)) return "edt";
  if (/\bedp\b/.test(s)) return "edp";
  if (/extrait/.test(s)) return "extrait";
  if (/(^|\s)parfum(\s|$)/.test(s)) return "parfum";
  if (/cologne|\bedc\b/.test(s)) return "cologne";
  return "none";
}

function subset(a: string[], b: string[]): boolean {
  const bs = new Set(b);
  return a.every((w) => bs.has(w));
}

function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const grams = (s: string) => {
    const g = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const k = s.slice(i, i + 2);
      g.set(k, (g.get(k) ?? 0) + 1);
    }
    return g;
  };
  const ga = grams(a);
  const gb = grams(b);
  let inter = 0;
  for (const [k, v] of ga) inter += Math.min(v, gb.get(k) ?? 0);
  return (2 * inter) / (a.length - 1 + (b.length - 1));
}

function prefMarker(p: string, c: string): number {
  if (p === c) return 1;
  if (c === "none") return p === "none" ? 1 : 0.7;
  if (p === "none") return 0.4;
  return 0;
}

function parsePerfumePath(href: string) {
  const m = href.match(/^\/perfume\/([^/]+)\/(.+)-(\d+)\.html$/);
  if (!m) return null;
  return { path: href, brandSeg: m[1], nameSlug: m[2], id: m[3] };
}

async function brandPerfumes(brandName: string): Promise<{ links: PerfumeLink[]; source: string } | null> {
  const slug = brandName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " ")
    .replace(/'/g, "")
    .replace(/\s+/g, "-");
  const candidates = [`designers/${slug}.html`, `niches/${slug}.html`];
  if (brandName === "YSL") candidates.unshift("designers/YSL.html");
  if (brandName === "Armani") candidates.unshift("designers/Armani.html");
  if (brandName === "Paco Rabanne") candidates.unshift("designers/Paco-Rabanne.html");
  if (brandName === "Mugler") candidates.unshift("designers/Thierry-Mugler.html");
  if (brandName === "Jo Malone") candidates.unshift("designers/Jo-Malone.html", "designers/Jo-Malone-London.html");
  if (brandName === "Penhaligon's") candidates.unshift("designers/Penhaligons.html", "niches/Penhaligons.html");

  for (const c of candidates) {
    const r = await curlText(`https://www.fragrantica.com/${c}`);
    await sleep(700);
    if (r.status !== 200 || r.text.length < 50_000) continue;
    const brandSeg = path.basename(new URL(r.finalUrl).pathname).replace(/\.html$/, "");
    const links: PerfumeLink[] = [];
    const seen = new Set<string>();
    const re = /<a[^>]*href="(\/perfume\/[^"]+\.html)"[^>]*>([\s\S]*?)<\/a>/g;
    let m: RegExpExecArray | null;
    let order = 0;
    while ((m = re.exec(r.text))) {
      const parsed = parsePerfumePath(m[1]);
      if (!parsed || parsed.brandSeg !== brandSeg || seen.has(parsed.path)) continue;
      seen.add(parsed.path);
      const inner = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const name = inner || parsed.nameSlug.replace(/-/g, " ");
      links.push({ path: parsed.path, brandSeg: parsed.brandSeg, name, id: parsed.id, order: order++ });
    }
    if (links.length > 5) return { links, source: r.finalUrl };
  }
  return null;
}

async function ddgPerfume(brandName: string, productName: string): Promise<PerfumeLink | null> {
  const q = encodeURIComponent(`site:fragrantica.com/perfume/ ${brandName} ${productName}`);
  const r = await curlText(`https://lite.duckduckgo.com/lite/?q=${q}`);
  await sleep(700);
  const re = /(?:href=")?(fragrantica\.com\/perfume\/[^"\s&]+\.html)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(r.text))) {
    const parsed = parsePerfumePath("/" + m[1].replace(/^fragrantica\.com/, ""));
    if (!parsed) continue;
    const sim = dice(compact(productName), compact(parsed.nameSlug));
    if (sim >= 0.55)
      return { path: parsed.path, brandSeg: parsed.brandSeg, name: parsed.nameSlug, id: parsed.id, order: 0 };
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function brandVariants(brandName: string): string[] {
  const out = new Set<string>([stripAccents(brandName).toLowerCase(), brandName.toLowerCase()]);
  if (brandName === "YSL") for (const b of ["yves saint laurent", "ysl"]) out.add(b);
  if (brandName === "Armani") for (const b of ["giorgio armani", "armani"]) out.add(b);
  if (brandName === "Paco Rabanne") for (const b of ["rabanne", "paco rabanne"]) out.add(b);
  if (brandName === "Mugler") for (const b of ["thierry mugler", "mugler"]) out.add(b);
  if (brandName === "Jo Malone") for (const b of ["jo malone london", "jo malone"]) out.add(b);
  if (brandName === "Penhaligon's") for (const b of ["penhaligons", "penhaligon's"]) out.add(b);
  if (brandName === "Frederic Malle") for (const b of ["frederic malle", "maison frederic malle"]) out.add(b);
  return [...out].sort((a, b) => b.length - a.length);
}

function cleanAnchor(text: string, brandName: string): string {
  let t = decodeEntities(text).replace(/\s+/g, " ").trim();
  if (/\b(19|20)\d{2}\b/.test(t)) {
    t = t.replace(/\s+\b(19|20)\d{2}\b/g, " ").replace(/\s+\d{1,7}$/, " ");
  }
  const variants = brandVariants(brandName);
  let prev = "";
  while (t !== prev) {
    prev = t;
    for (const b of variants) {
      const re = new RegExp(`\\s+${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
      t = t.replace(re, " ").trim();
    }
  }
  return t.replace(/\s+/g, " ").trim();
}

function stripBrands(s: string, brandName: string): string {
  let t = s;
  for (const b of brandVariants(brandName)) {
    const re = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    t = t.replace(re, " ");
  }
  return t.replace(/\s+/g, " ").trim();
}

function pickPerfume(
  links: PerfumeLink[],
  productName: string,
  brandName: string
): { link: PerfumeLink; why: string } | null {
  const pToks = tokens(productName);
  const pCore = coreOf(tokens(stripBrands(productName, brandName)));
  const pCompact = compact(pToks);
  const pMarker = markerOf(pToks);
  const pCoreKey = [...pCore].sort().join(" ");

  type Scored = { link: PerfumeLink; score: number; dice: number; order: number; why: string };
  const scored: Scored[] = [];

  for (const link of links) {
    const cleaned = cleanAnchor(link.name, brandName);
    const cToks = tokens(cleaned);
    const cCore = coreOf(tokens(stripBrands(cleaned, brandName)));
    const cCompact = compact(cToks);
    const cCoreKey = [...cCore].sort().join(" ");

    const pInC = pCore.length > 0 && subset(pCore, cCore);
    const cInP = cCore.length > 0 && subset(cCore, pCore);
    const compactOk = pCompact.includes(cCompact) || cCompact.includes(pCompact);
    const diceVal = dice(pCompact, cCompact);
    const strong = pInC || cInP || (compactOk && diceVal >= 0.6) || diceVal >= 0.72;
    if (!strong) continue;

    const pref = prefMarker(pMarker, markerOf(cToks));
    if (pref === 0 && pMarker !== "none") continue;

    let base: number;
    let relation: string;
    if (pCoreKey === cCoreKey && pCore.length > 0) {
      base = 100;
      relation = "core-exact";
    } else if (cInP) {
      base = 55 + 25 * (cCore.length / pCore.length);
      relation = "core-simpler";
    } else if (pInC) {
      base = Math.max(5, 45 - 14 * (cCore.length - pCore.length));
      relation = "derivative";
    } else {
      base = Math.min(40, 10 + 30 * diceVal);
      relation = "fuzzy";
    }

    const markerPts = pref >= 1 ? 18 : pref >= 0.7 ? 10 : pref >= 0.4 ? 8 : 4;
    const score = base + markerPts;
    scored.push({
      link,
      score,
      dice: diceVal,
      order: link.order,
      why: `${relation} sim ${diceVal.toFixed(2)} | "${link.name}"`,
    });
  }

  scored.sort((a, b) => b.score - a.score || b.dice - a.dice || a.order - b.order);
  const best = scored[0];
  if (!best) return null;
  return { link: best.link, why: best.why };
}

async function downloadJpeg(url: string, minBytes = 8_000): Promise<Buffer | null> {
  try {
    const r = await curlGet(url);
    await sleep(250);
    if (r.code !== 200 || !r.contentType.startsWith("image/")) return null;
    if (r.body.length < minBytes) return null;
    if (r.contentType === "image/jpeg") return r.body;
    return await sharp(r.body).jpeg({ quality: 88 }).toBuffer();
  } catch {
    return null;
  }
}

async function padToSquare(buf: Buffer): Promise<Buffer> {
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h || w === h) return buf;
  const px = await sharp(buf)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer();
  const background = { r: px[0], g: px[1], b: px[2] ?? 255, alpha: 1 };
  const side = Math.max(w, h);
  return sharp(buf)
    .resize(side, side, { fit: "contain", position: "center", background })
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function centerSquare(buf: Buffer): Promise<Buffer> {
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) return buf;
  const side = Math.min(w, h);
  if (side === Math.max(w, h)) return buf;
  return sharp(buf)
    .extract({ left: Math.round((w - side) / 2), top: Math.round((h - side) / 2), width: side, height: side })
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function coverImage(id: string): Promise<Buffer | null> {
  for (const u of [
    `https://fimgs.net/mdimg/perfume-thumbs/375x500.${id}.2x.jpg`,
    `https://fimgs.net/mdimg/perfume/o.${id}.jpg`,
    `https://fimgs.net/mdimg/perfume-thumbs/375x500.${id}.jpg`,
  ]) {
    const buf = await downloadJpeg(u);
    if (buf) return await padToSquare(buf);
  }
  return null;
}

async function detailImage(link: PerfumeLink): Promise<Buffer | null> {
  const social = await downloadJpeg(`https://fimgs.net/mdimg/perfume/social.${link.id}.jpg`, 10_000);
  if (social) return await centerSquare(social);
  const r = await curlText(`https://www.fragrantica.com${link.path}`);
  await sleep(700);
  if (r.status === 200) {
    const photos = r.text.match(/https:\/\/fimgs\.net\/photogram\/p1200\/[^"'\s\\)]+\.jpg/g);
    if (photos?.length) {
      const buf = await downloadJpeg(photos[0]);
      if (buf) return buf;
    }
  }
  return null;
}

async function loadManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = await loadManifest();

  const products = await prisma.product.findMany({
    include: { brand: true },
    orderBy: { createdAt: "asc" },
  });

  const brandCache = new Map<string, PerfumeLink[] | null>();
  const stats = { synced: 0, exists: 0, noMatch: 0, error: 0, keptPlaceholder: 0 };

  for (const product of products) {
    const coverFile = path.join(OUT_DIR, `${product.slug}-1.jpg`);
    const detailFile = path.join(OUT_DIR, `${product.slug}-2.jpg`);
    const entry = manifest[product.slug];
    const coverOk = (await stat(coverFile).then((s) => s.size).catch(() => 0)) >= 8_000;

    if (!FORCE && entry?.status === "synced" && coverOk) {
      console.log(`EXISTS  ${product.slug}`);
      stats.exists++;
      continue;
    }

    try {
      if (!brandCache.has(product.brand.name)) {
        brandCache.set(product.brand.name, (await brandPerfumes(product.brand.name))?.links ?? null);
      }
      const links = brandCache.get(product.brand.name) ?? null;
      let picked = links ? pickPerfume(links, product.name, product.brand.name) : null;

      if (!picked) {
        const viaDdg = await ddgPerfume(product.brand.name, product.name);
        if (viaDdg) picked = { link: viaDdg, why: `lite-ddg | "${viaDdg.name}"` };
      }

      if (!picked) {
        console.log(`NO-MATCH  [${product.brand.name}] ${product.name}`);
        manifest[product.slug] = { status: "no-match", at: new Date().toISOString() };
        stats.noMatch++;
        continue;
      }

      const cover = await coverImage(picked.link.id);
      if (!cover) {
        console.log(`FAIL-COVER  ${product.slug} (${picked.link.path})`);
        manifest[product.slug] = { status: "error", at: new Date().toISOString() };
        stats.error++;
        continue;
      }
      await writeFile(coverFile, cover);

      const detail = await detailImage(picked.link);
      if (detail) {
        await writeFile(detailFile, detail);
      } else {
        console.log(`KEEP-PLACEHOLDER-2  ${product.slug}`);
        stats.keptPlaceholder++;
      }

      console.log(`SYNC  ${product.slug} <- ${picked.why}`);
      manifest[product.slug] = { status: "synced", at: new Date().toISOString() };
      stats.synced++;
    } catch (e) {
      console.log(`ERROR  ${product.slug}: ${e instanceof Error ? e.message : e}`);
      manifest[product.slug] = { status: "error", at: new Date().toISOString() };
      stats.error++;
    }
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log("\n========================================");
  console.log(`synced:                  ${stats.synced}`);
  console.log(`already synced:          ${stats.exists}`);
  console.log(`no match:                ${stats.noMatch}`);
  console.log(`errors:                  ${stats.error}`);
  console.log(`detail kept placeholder: ${stats.keptPlaceholder}`);
  console.log("========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
