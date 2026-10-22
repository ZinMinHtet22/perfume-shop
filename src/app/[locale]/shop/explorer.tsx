import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Concentration, Gender } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";

export type ShopFilters = {
  q: string;
  gender: string;
  concentration: string;
  category: string;
  sort: string;
};

const GENDERS: Gender[] = ["MEN", "WOMEN", "UNISEX"];
const CONCENTRATIONS: Concentration[] = ["EDT", "EDP", "PARFUM", "COLOGNE"];

export async function ShopExplorer({
  locale,
  filters,
}: {
  locale: string;
  filters: ShopFilters;
}) {
  await connection();
  const t = await getTranslations("Filters");
  const session = await auth();

  const [categories, products, wished] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(filters.gender && GENDERS.includes(filters.gender as Gender)
          ? { gender: filters.gender as Gender }
          : {}),
        ...(filters.concentration &&
        CONCENTRATIONS.includes(filters.concentration as Concentration)
          ? { concentration: filters.concentration as Concentration }
          : {}),
        ...(filters.category
          ? { category: { slug: filters.category } }
          : {}),
        ...(filters.q
          ? {
              OR: [
                { name: { contains: filters.q, mode: "insensitive" } },
                {
                  translations: {
                    some: {
                      name: { contains: filters.q, mode: "insensitive" },
                    },
                  },
                },
                { brand: { name: { contains: filters.q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        brand: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        translations: { where: { locale: "my" } },
        variants: { orderBy: { sizeMl: "asc" } },
      },
      orderBy:
        filters.sort === "price-asc"
          ? { price: "asc" }
          : filters.sort === "price-desc"
            ? { price: "desc" }
            : { createdAt: "desc" },
    }),
    session?.user?.id
      ? prisma.wishlistItem
          .findMany({
            where: { userId: session.user.id },
            select: { productId: true },
          })
          .then((rows) => new Set(rows.map((r) => r.productId)))
      : Promise.resolve(new Set<string>()),
  ]);

  const selectClass =
    "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

  return (
    <>
      <form
        method="get"
        className="mb-8 grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <Input
          name="q"
          defaultValue={filters.q}
          placeholder={t("search")}
          className="h-9 lg:col-span-2"
        />
        <select name="gender" defaultValue={filters.gender} className={selectClass}>
          <option value="">{t("allGenders")}</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {t(`gender.${g}`)}
            </option>
          ))}
        </select>
        <select
          name="concentration"
          defaultValue={filters.concentration}
          className={selectClass}
        >
          <option value="">{t("allConcentrations")}</option>
          {CONCENTRATIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={filters.category}
          className={selectClass}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select name="sort" defaultValue={filters.sort} className={selectClass}>
            <option value="newest">{t("sortNewest")}</option>
            <option value="price-asc">{t("sortPriceAsc")}</option>
            <option value="price-desc">{t("sortPriceDesc")}</option>
          </select>
          <Button type="submit" size="sm" className="h-9 shrink-0">
            {t("apply")}
          </Button>
        </div>
      </form>

      <p className="mb-4 text-sm text-muted-foreground">
        {t("results", { count: products.length })}
      </p>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const name =
              locale === "my" && p.translations[0]
                ? p.translations[0].name
                : p.name;
            const image = p.images[0];
            const baseVariant =
              p.variants.find((v) => v.sizeMl === 50) ?? p.variants[0];
            return (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  slug: p.slug,
                  name,
                  brandName: p.brand.name,
                  concentration: p.concentration,
                  price: baseVariant?.price ?? p.price,
                  compareAtPrice: p.compareAtPrice,
                  imageUrl: image?.url,
                  imageAlt: image?.alt ?? undefined,
                  wished: wished.has(p.id),
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
