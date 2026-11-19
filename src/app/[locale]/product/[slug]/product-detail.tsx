import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { AddToCart } from "@/components/product/add-to-cart";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductGallery } from "@/components/product/product-gallery";
import FadeContent from "@/components/react-bits/fade-content";
import { ReviewForm } from "./review-form";

export async function ProductDetail({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      translations: { where: { locale: "my" } },
      variants: { orderBy: { sizeMl: "asc" } },
      productNotes: { include: { note: true } },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const [reviews, wished] = await Promise.all([
    prisma.review.findMany({
      where: { productId: product.id, isApproved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    userId
      ? prisma.wishlistItem
          .findUnique({
            where: {
              userId_productId: { userId, productId: product.id },
            },
          })
          .then(Boolean)
      : Promise.resolve(false),
  ]);

  const t = await getTranslations("Product");
  const isMy = locale === "my";
  const tr = product.translations[0];
  const name = isMy && tr ? tr.name : product.name;
  const description = isMy && tr ? tr.description : product.description;
  const image = product.images[0];

  const notes = {
    TOP: product.notesTop,
    HEART: product.notesHeart,
    BASE: product.notesBase,
  };

  const relatedNotes = product.productNotes.map((pn) => pn.note);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-10 lg:px-10 lg:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.18em] text-taupe"
      >
        <Link href="/shop" className="transition-colors hover:text-ivory">
          Shop
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ash">{product.brand.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
        <ProductGallery
          images={product.images.map((img) => ({ url: img.url, alt: img.alt }))}
          fallbackAlt={name}
          wishlistSlot={<WishlistButton productId={product.id} initialWished={wished} />}
        />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow text-champagne">{product.brand.name}</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ivory sm:text-5xl">
            {name}
          </h1>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-[2px] border border-border px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.16em] text-ash">
              {product.concentration}
            </span>
            <span className="rounded-[2px] border border-border px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.16em] text-ash">
              {t(`gender.${product.gender}`)}
            </span>
            {product.scentFamily ? (
              <span className="rounded-[2px] border border-border px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.16em] text-ash">
                {product.scentFamily}
              </span>
            ) : null}
            {product.compareAtPrice ? (
              <span className="rounded-[2px] border border-champagne/40 px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.16em] text-champagne">
                −
                {Math.round(
                  (1 - product.price / product.compareAtPrice) * 100
                )}
                %
              </span>
            ) : null}
          </div>

          <div className="mt-8 border-y border-border py-6">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                name,
                brandName: product.brand.name,
                imageUrl: image?.url,
              }}
              variants={product.variants.map((v) => ({
                id: v.id,
                sizeMl: v.sizeMl,
                price: v.price,
                stock: v.stock,
              }))}
            />
          </div>

          <FadeContent blur duration={800} delay={60}>
            <div className="mt-8">
              <h2 className="eyebrow text-taupe">{t("description")}</h2>
              <p className="mt-3 text-sm leading-[1.8] text-ash">{description}</p>
            </div>
          </FadeContent>

          <FadeContent blur duration={800} delay={120}>
            <div className="mt-8 rounded-[4px] border border-border bg-surface/60 p-6">
              <h2 className="eyebrow text-taupe">{t("notes")}</h2>
              <dl className="mt-5 space-y-4">
                {(["TOP", "HEART", "BASE"] as const).map((level) => (
                  <div key={level} className="grid grid-cols-[62px_1fr] gap-4">
                    <dt className="eyebrow pt-0.5 text-champagne">
                      {t(`noteLevels.${level}`)}
                    </dt>
                    <dd className="text-sm leading-relaxed text-ivory/85">
                      {notes[level] ??
                        (relatedNotes
                          .filter((n) => n.type === level)
                          .map((n) => n.name)
                          .join(", ") || "—")}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </FadeContent>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-taupe">
            <span>
              {t("category")}:{" "}
              <span className="text-ash">{product.category.name}</span>
            </span>
            {product.variants.some((v) => v.price === product.price) ? (
              <span>
                {t("priceNote", { price: formatMMK(product.price) })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <FadeContent blur duration={800}>
        <section className="mt-20 border-t border-border pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <h2 className="font-display text-2xl tracking-[-0.01em] text-ivory sm:text-3xl">
              {t("reviews")}
            </h2>
          {reviews.length > 0 ? (
            <p className="tabular text-sm text-ash">
              <span className="text-champagne" aria-hidden="true">
                {"★".repeat(Math.round(avgRating))}
                {"☆".repeat(5 - Math.round(avgRating))}
              </span>{" "}
              {avgRating.toFixed(1)} · {t("reviewCount", { count: reviews.length })}
            </p>
          ) : null}
        </div>

        <div className="mt-8">
          {userId ? (
            <ReviewForm productId={product.id} locale={locale} />
          ) : (
            <p className="rounded-[4px] border border-dashed border-border p-5 text-sm text-ash">
              {t("signInToReview")}{" "}
              <Link
                href="/login"
                className="text-ivory underline decoration-champagne/60 underline-offset-4 transition-colors hover:text-champagne"
              >
                {t("signIn")}
              </Link>
            </p>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="mt-8 text-sm text-ash">{t("noReviews")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {reviews.map((review) => (
              <li key={review.id} className="py-6">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ivory">
                    {review.user.name ?? t("anonymous")}
                  </p>
                  <span
                    className="text-xs text-champagne"
                    aria-label={`${review.rating}/5`}
                  >
                    <span aria-hidden="true">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </span>
                </div>
                {review.title ? (
                  <p className="mb-1 text-sm font-medium text-ivory">
                    {review.title}
                  </p>
                ) : null}
                <p className="text-sm leading-relaxed text-ash">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        )}
        </section>
      </FadeContent>
    </div>
  );
}
