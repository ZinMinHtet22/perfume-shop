import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";
import type { PrismaClient } from "../src/generated/prisma/client";

const SIZE = 600;
const OUT_DIR = path.join(process.cwd(), "public", "images", "products");

const PALETTES: [string, string][] = [
  ["#1f1235", "#5b2a86"],
  ["#0f2027", "#2c5364"],
  ["#3e2723", "#a1887f"],
  ["#1b4332", "#52b788"],
  ["#263238", "#607d8b"],
  ["#4a148c", "#9575cd"],
  ["#4e342e", "#d7a86e"],
  ["#263238", "#455a64"],
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function short(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function svgCard(
  slug: string,
  brand: string,
  name: string,
  variant: number
): string {
  const [c1, c2] = PALETTES[hashStr(slug + variant) % PALETTES.length];
  const angle = 20 + (hashStr(slug) % 40);

  if (variant === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
  <g transform="translate(300 320)">
    <rect x="-52" y="-170" width="104" height="34" rx="8" fill="#e8d5a3"/>
    <rect x="-16" y="-140" width="32" height="26" fill="#cbb37a"/>
    <rect x="-85" y="-116" width="170" height="236" rx="26" fill="url(#glass)" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2"/>
    <rect x="-55" y="-30" width="110" height="86" rx="6" fill="#ffffff" fill-opacity="0.85"/>
    <text x="0" y="-4" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="15" letter-spacing="2" fill="#3a2f13">${esc(short(brand.toUpperCase(), 14))}</text>
    <line x1="-40" y1="14" x2="40" y2="14" stroke="#c9a227" stroke-width="2"/>
    <text x="0" y="40" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#5a4c22">${esc(short(name, 16))}</text>
  </g>
  <text x="300" y="552" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" letter-spacing="4" fill="#ffffff" fill-opacity="0.75">${esc(short(brand.toUpperCase(), 20))}</text>
</svg>`;
  }

  const initials = brand
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg2" gradientTransform="rotate(${angle + 90})">
      <stop offset="0%" stop-color="${c2}"/><stop offset="100%" stop-color="${c1}"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg2)"/>
  <circle cx="300" cy="300" r="150" fill="none" stroke="#e8d5a3" stroke-opacity="0.7" stroke-width="3"/>
  <circle cx="300" cy="300" r="130" fill="#ffffff" fill-opacity="0.1"/>
  <text x="300" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="96" fill="#f5e6c4" letter-spacing="6">${esc(initials)}</text>
  <text x="300" y="500" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" letter-spacing="3" fill="#ffffff" fill-opacity="0.85">${esc(short(name.toUpperCase(), 22))}</text>
</svg>`;
}

export async function generateProductImages(
  prisma: PrismaClient,
  opts: { overwrite?: boolean } = {}
): Promise<{ written: number; updated: number; skipped: number }> {
  mkdirSync(OUT_DIR, { recursive: true });

  const products = await prisma.product.findMany({
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  let written = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const count = Math.max(product.images.length, 1);
    for (let index = 0; index < count; index++) {
      const fileName = `${product.slug}-${index + 1}.jpg`;
      const filePath = path.join(OUT_DIR, fileName);

      const existingSize = statSync(filePath, { throwIfNoEntry: false })?.size ?? 0;
      if (existingSize >= 8000 && !opts.overwrite) {
        skipped++;
      } else {
        const svg = svgCard(
          product.slug,
          product.brand.name,
          product.name,
          index
        );
        await sharp(Buffer.from(svg))
          .jpeg({ quality: 85 })
          .toFile(filePath);
        written++;
      }

      const newUrl = `/images/products/${fileName}`;
      const existing = product.images[index];
      if (existing) {
        if (existing.url !== newUrl) {
          await prisma.productImage.update({
            where: { id: existing.id },
            data: { url: newUrl },
          });
          updated++;
        }
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: newUrl,
            alt: product.name,
            sortOrder: index,
          },
        });
        updated++;
      }
    }
  }

  return { written, updated, skipped };
}
