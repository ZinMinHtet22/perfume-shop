import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { FeaturedProducts } from "./featured-products";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#14100c] via-[#1c1611] to-[#0f0c0a] text-[#f4ece1]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_50%_at_70%_30%,rgba(201,162,39,0.25),transparent_70%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <Badge
              variant="secondary"
              className="w-fit border-[#c9a227]/30 bg-[#c9a227]/15 text-[#e6c86a] hover:bg-[#c9a227]/20"
            >
              {t("heroBadge")}
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t("heading")}
            </h1>
            <p className="max-w-md text-lg text-[#c9bba8]">{t("tagline")}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                className="bg-[#c9a227] text-[#1a140c] hover:bg-[#b08f1f]"
                asChild
              >
                <Link href="/shop">{t("cta")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#c9a227]/40 text-[#f4ece1] hover:bg-[#c9a227]/10"
                asChild
              >
                <Link href="/shop">{t("secondaryCta")}</Link>
              </Button>
            </div>
          </div>
          <HeroCanvas />
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-16 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        }
      >
        <FeaturedProducts locale={locale} />
      </Suspense>

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-3">
          <Card>
            <CardContent className="space-y-2 p-6">
              <h3 className="font-semibold">{t("values.pay.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("values.pay.desc")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-6">
              <h3 className="font-semibold">{t("values.delivery.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("values.delivery.desc")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-6">
              <h3 className="font-semibold">{t("values.authentic.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("values.authentic.desc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("ctaBand.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("ctaBand.desc")}
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/shop">{t("ctaBand.button")}</Link>
        </Button>
      </section>
    </>
  );
}
