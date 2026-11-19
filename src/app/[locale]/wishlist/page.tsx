import { connection } from "next/server";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

export const instant = false;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function WishlistPage({ params }: Props) {
  await connection();
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Wishlist");

  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <p className="eyebrow text-champagne">Wishlist</p>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.02em] text-ivory">
          {t("title")}
        </h1>
        <p className="mt-4 text-ash">{t("signInPrompt")}</p>
        <Button
          className="mt-8 h-11 rounded-[4px] px-7 hover:bg-brass"
          asChild
        >
          <Link href="/login">{t("signIn")}</Link>
        </Button>
      </div>
    );
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          brand: true,
          translations: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          variants: { orderBy: { price: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-14 lg:px-10 lg:py-20">
      <div className="border-b border-border pb-8">
        <p className="eyebrow text-champagne">Saved</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ivory sm:text-5xl">
          {t("title")}
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-5 rounded-[4px] border border-border py-24 text-center">
          <p className="text-sm text-ash">{t("empty")}</p>
          <Button
            className="h-11 rounded-[4px] px-7 hover:bg-brass"
            asChild
          >
            <Link href="/shop">{t("continueShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const product = item.product;
            const translation = product.translations.find(
              (tr) => tr.locale === locale
            );
            const name = translation?.name ?? product.name;
            const minPrice = product.variants[0]?.price ?? product.price;
            return (
              <ProductCard
                key={item.id}
                product={{
                  id: product.id,
                  slug: product.slug,
                  name,
                  brandName: product.brand.name,
                  concentration: product.concentration,
                  price: minPrice,
                  imageUrl: product.images[0]?.url,
                  imageAlt: product.images[0]?.alt ?? undefined,
                  wished: true,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
