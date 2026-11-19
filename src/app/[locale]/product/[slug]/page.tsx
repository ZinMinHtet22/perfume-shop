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
        <div className="mx-auto grid w-full max-w-[1320px] gap-12 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16 lg:px-10 lg:py-16">
          <div className="aspect-square animate-pulse rounded-[4px] bg-surface" />
          <div className="space-y-5">
            <div className="h-3 w-24 animate-pulse rounded-sm bg-surface" />
            <div className="h-10 w-3/4 animate-pulse rounded-sm bg-surface" />
            <div className="h-24 w-full animate-pulse rounded-sm bg-surface" />
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
