import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/product-card";
import { ScrollReveal } from "@/components/scroll-reveal";

export async function FeaturedProducts({ locale }: { locale: string }) {
  await connection();
  const t = await getTranslations("Home");
  const session = await auth();

  const [products, wished] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        brand: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        translations: { where: { locale: "my" } },
        variants: { orderBy: { sizeMl: "asc" } },
      },
      orderBy: [{ compareAtPrice: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take: 8,
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

  if (products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <ScrollReveal>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-champagne">{t("featuredEyebrow")}</p>
            <h2 className="mt-4 font-display text-3xl leading-tight tracking-[-0.01em] text-ivory sm:text-4xl">
              {t("featuredTitle")}
            </h2>
          </div>
          <Link
            href="/shop"
            className="group hidden items-center gap-3 pb-1 text-sm text-ash transition-colors hover:text-ivory sm:inline-flex"
          >
            {t("featuredAll")}
            <span className="h-px w-6 bg-champagne transition-all duration-300 group-hover:w-10" />
          </Link>
        </div>
      </ScrollReveal>
      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => {
          const name =
            locale === "my" && p.translations[0] ? p.translations[0].name : p.name;
          const image = p.images[0];
          const baseVariant =
            p.variants.find((v) => v.sizeMl === 50) ?? p.variants[0];
          return (
            <ScrollReveal key={p.id} delay={(i % 4) * 75}>
              <ProductCard
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
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
