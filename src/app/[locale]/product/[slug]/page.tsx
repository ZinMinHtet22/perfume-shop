import { setRequestLocale } from "next-intl/server";
import { connection } from "next/server";
import { Suspense } from "react";
import { ProductDetail } from "./product-detail";

export const instant = false;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default function ProductPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      }
    >
      <ProductPageContent params={params} />
    </Suspense>
  );
}

async function ProductPageContent({ params }: Props) {
  await connection();
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <ProductDetail slug={slug} locale={locale} />;
}
