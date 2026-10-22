import Image from "next/image";
import { connection } from "next/server";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistButton } from "@/components/wishlist-button";

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
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-semibold">{t("title")}</h1>
        <p className="mb-6 text-muted-foreground">{t("signInPrompt")}</p>
        <Button asChild>
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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border py-16 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Button asChild>
            <Link href="/shop">{t("continueShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const product = item.product;
            const translation = product.translations.find(
              (tr) => tr.locale === locale
            );
            const name = translation?.name ?? product.name;
            const minPrice = product.variants[0]?.price ?? product.price;
            const imageUrl = product.images[0]?.url;
            return (
              <Card key={item.id} className="gap-2 overflow-hidden py-0">
                <div className="relative aspect-square bg-muted">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute right-2 top-2">
                    <WishlistButton productId={product.id} initialWished />
                  </div>
                </div>
                <CardContent className="space-y-1 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {product.brand.name}
                  </p>
                  <Link
                    href={`/product/${product.slug}`}
                    className="line-clamp-1 font-medium hover:underline"
                  >
                    {name}
                  </Link>
                  <p className="font-semibold">{formatMMK(minPrice)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
