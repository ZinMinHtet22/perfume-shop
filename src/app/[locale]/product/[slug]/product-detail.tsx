import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/product/add-to-cart";
import { WishlistButton } from "@/components/wishlist-button";
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute right-3 top-3">
            <WishlistButton productId={product.id} initialWished={wished} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {product.brand.name}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {name}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{product.concentration}</Badge>
              <Badge variant="outline">{t(`gender.${product.gender}`)}</Badge>
              {product.scentFamily ? (
                <Badge variant="outline">
                  {t("scentFamily")}: {product.scentFamily}
                </Badge>
              ) : null}
              {product.compareAtPrice ? (
                <Badge className="bg-[#c9a227]/15 text-[#8a6d10]">
                  −
                  {Math.round(
                    (1 - product.price / product.compareAtPrice) * 100
                  )}
                  %
                </Badge>
              ) : null}
            </div>
          </div>

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

          <div>
            <h2 className="mb-2 font-medium">{t("description")}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/30 p-5">
            <h2 className="mb-4 font-medium">{t("notes")}</h2>
            <div className="space-y-3">
              {(["TOP", "HEART", "BASE"] as const).map((level) => (
                <div key={level} className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className="w-16 justify-center shrink-0"
                  >
                    {t(`noteLevels.${level}`)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {notes[level] ??
                      (relatedNotes
                        .filter((n) => n.type === level)
                        .map((n) => n.name)
                        .join(", ") || "—")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <span>{t("category")}: </span>
            <span className="text-foreground">{product.category.name}</span>
          </div>

          {product.variants.some((v) => v.price === product.price) ? (
            <p className="text-xs text-muted-foreground">
              {t("priceNote", { price: formatMMK(product.price) })}
            </p>
          ) : null}
        </div>
      </div>

      <section className="mt-14 space-y-6 border-t pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{t("reviews")}</h2>
          {reviews.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              <span aria-hidden="true">
                {"★".repeat(Math.round(avgRating))}
                {"☆".repeat(5 - Math.round(avgRating))}
              </span>{" "}
              {avgRating.toFixed(1)} · {t("reviewCount", { count: reviews.length })}
            </p>
          ) : null}
        </div>

        {userId ? (
          <ReviewForm productId={product.id} locale={locale} />
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {t("signInToReview")}{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
              {t("signIn")}
            </Link>
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noReviews")}</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-lg border p-4">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{review.user.name ?? t("anonymous")}</p>
                  <span
                    className="text-sm text-[#c9a227]"
                    aria-label={`${review.rating}/5`}
                  >
                    <span aria-hidden="true">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </span>
                </div>
                {review.title ? (
                  <p className="mb-1 text-sm font-medium">{review.title}</p>
                ) : null}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
