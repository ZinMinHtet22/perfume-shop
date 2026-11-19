import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import FadeContent from "@/components/react-bits/fade-content";
import { ShopExplorer, type ShopFilters } from "./explorer";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ShopPage({ params, searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1320px] px-6 py-14 lg:px-10 lg:py-20">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-surface" />
          <div className="mt-5 h-12 w-48 animate-pulse rounded-sm bg-surface" />
          <div className="mt-10 h-24 animate-pulse rounded-[4px] bg-surface" />
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square animate-pulse rounded-[4px] bg-surface" />
                <div className="mt-4 h-2.5 w-20 animate-pulse rounded-sm bg-surface" />
                <div className="mt-3 h-4 w-40 animate-pulse rounded-sm bg-surface" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ShopPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ShopPageContent({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const str = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : "";

  const filters: ShopFilters = {
    q: str(sp.q),
    gender: str(sp.gender),
    concentration: str(sp.concentration),
    category: str(sp.category),
    sort: str(sp.sort) || "newest",
  };

  const t = await getTranslations("Shop");

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-14 lg:px-10 lg:py-20">
      <FadeContent blur duration={800}>
        <div className="max-w-2xl border-b border-border pb-10">
          <p className="eyebrow text-champagne">The collection</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ivory sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ash">
            {t("subtitle")}
          </p>
        </div>
      </FadeContent>
      <div className="mt-10">
        <ShopExplorer locale={locale} filters={filters} />
      </div>
    </div>
  );
}
