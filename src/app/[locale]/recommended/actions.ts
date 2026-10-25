"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { shuffle } from "@/lib/shuffle";
import type { ProductCardData } from "@/components/product-card";

/** How many recommendations are returned; the section shows 8 at a time. */
const RETURN = 16;
/** Bigger pool than we need, so the picks can be shuffled on every call. */
const POOL = 24;
/** How many recently viewed products we accept as seeds. */
const MAX_SEEDS = 8;

/**
 * Picks products similar to the ones the visitor has been viewing:
 * same category first, then same brand, backfilled with other popular items
 * so the section is always full.
 */
export async function getRecommendationsAction(
  seedIds: string[],
  locale: string
): Promise<ProductCardData[]> {
  const seeds = [
    ...new Set(
      seedIds.filter((id) => typeof id === "string" && id.length > 0)
    ),
  ].slice(0, MAX_SEEDS);

  if (seeds.length === 0) return [];

  const seedRows = await prisma.product.findMany({
    where: { id: { in: seeds }, isActive: true },
    select: { categoryId: true, brandId: true },
  });

  if (seedRows.length === 0) return [];

  const categoryIds = [...new Set(seedRows.map((row) => row.categoryId))];
  const brandIds = [...new Set(seedRows.map((row) => row.brandId))];

  const similar = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: seeds },
      OR: [{ categoryId: { in: categoryIds } }, { brandId: { in: brandIds } }],
    },
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
    take: POOL,
  });

  // Shuffle so repeat visits surface a different set of similar perfumes.
  let products = shuffle(similar).slice(0, RETURN);

  if (products.length < RETURN) {
    const fill = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: [...seeds, ...products.map((p) => p.id)] },
      },
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
      take: POOL,
    });
    products = [...products, ...shuffle(fill)].slice(0, RETURN);
  }

  const session = await auth();
  const wished = session?.user?.id
    ? new Set(
        (
          await prisma.wishlistItem.findMany({
            where: { userId: session.user.id },
            select: { productId: true },
          })
        ).map((row) => row.productId)
      )
    : new Set<string>();

  return products.map((p) => {
    const image = p.images[0];
    const baseVariant = p.variants.find((v) => v.sizeMl === 50) ?? p.variants[0];
    return {
      id: p.id,
      slug: p.slug,
      name:
        locale === "my" && p.translations[0] ? p.translations[0].name : p.name,
      brandName: p.brand.name,
      concentration: p.concentration,
      price: baseVariant?.price ?? p.price,
      compareAtPrice: p.compareAtPrice,
      imageUrl: image?.url,
      imageAlt: image?.alt ?? undefined,
      wished: wished.has(p.id),
    };
  });
}
