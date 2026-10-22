import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ShopExplorer, type ShopFilters } from "./explorer";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ShopPage({ params, searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="mb-8 h-10 w-32 animate-pulse rounded bg-muted" />
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-lg bg-muted" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
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
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ShopExplorer locale={locale} filters={filters} />
    </div>
  );
}
