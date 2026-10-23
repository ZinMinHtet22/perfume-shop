import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ file: string }> };

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_request: Request, { params }: Params) {
  const { file } = await params;

  if (!/^[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(file)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "uploads", "qr", file);
    const bytes = await readFile(filePath);
    const ext = path.extname(file).toLowerCase();
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }
}
