import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { shuffle } from "@/lib/shuffle";
import type { ProductCardData } from "@/components/product-card";
import { RecommendedProducts } from "./recommended/recommended";

/** Pool size: the client shows 8 of these and auto-shuffles the rest in. */
const TARGET = 16;

/**
 * Server half of the home page recommendations: ships a diversified set of
 * picks (one product per category first) so first-time visitors still see a
 * full section, and the client half can upgrade it once it knows what the
 * visitor has viewed.
 */
export async function RecommendedSection({ locale }: { locale: string }) {
  await connection();
  const session = await auth();

  const [rows, wished] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        brand: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        translations: { where: { locale: "my" } },
        variants: { orderBy: { sizeMl: "asc" } },
      },
      orderBy: [
        { compareAtPrice: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: 60,
    }),
    session?.user?.id
      ? prisma.wishlistItem
          .findMany({
            where: { userId: session.user.id },
            select: { productId: true },
          })
          .then((items) => new Set(items.map((item) => item.productId)))
      : Promise.resolve(new Set<string>()),
  ]);

  // Shuffle the pool first so both the picks and their order change per load.
  const pool = shuffle(rows);

  // One product per category first, then fill the remaining slots.
  const picked: typeof pool = [];
  const seenCategories = new Set<string>();
  for (const row of pool) {
    if (picked.length >= TARGET) break;
    if (!seenCategories.has(row.categoryId)) {
      seenCategories.add(row.categoryId);
      picked.push(row);
    }
  }
  for (const row of pool) {
    if (picked.length >= TARGET) break;
    if (!picked.includes(row)) picked.push(row);
  }

  if (picked.length === 0) return null;

  const fallback: ProductCardData[] = picked.map((p) => {
    const image = p.images[0];
    const baseVariant = p.variants.find((v) => v.sizeMl === 50) ?? p.variants[0];
    return {
      id: p.id,
      slug: p.slug,
      name: locale === "my" && p.translations[0] ? p.translations[0].name : p.name,
      brandName: p.brand.name,
      concentration: p.concentration,
      price: baseVariant?.price ?? p.price,
      compareAtPrice: p.compareAtPrice,
      imageUrl: image?.url,
      imageAlt: image?.alt ?? undefined,
      wished: wished.has(p.id),
    };
  });

  return <RecommendedProducts locale={locale} fallback={fallback} />;
}
