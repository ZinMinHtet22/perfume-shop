import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import BlurText from "@/components/react-bits/blur-text";
import Magnet from "@/components/react-bits/magnet";
import FadeContent from "@/components/react-bits/fade-content";
import { FeaturedProducts } from "./featured-products";
import { RecommendedSection } from "./recommended-section";

type Props = {
  params: Promise<{ locale: string }>;
};

const shell = "mx-auto w-full max-w-[1320px] px-6 lg:px-10";

function ProductGridSkeleton() {
  return (
    <div className={`${shell} py-16 lg:py-24`}>
      <div className="h-3 w-28 animate-pulse rounded-sm bg-surface" />
      <div className="mt-6 h-9 w-64 animate-pulse rounded-sm bg-surface" />
      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square animate-pulse rounded-[4px] bg-surface" />
            <div className="mt-4 h-2.5 w-20 animate-pulse rounded-sm bg-surface" />
            <div className="mt-3 h-4 w-40 animate-pulse rounded-sm bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");

  const values = [
    {
      index: "01",
      label: t("values.pay.label"),
      title: t("values.pay.title"),
      desc: t("values.pay.desc"),
    },
    {
      index: "02",
      label: t("values.delivery.label"),
      title: t("values.delivery.title"),
      desc: t("values.delivery.desc"),
    },
    {
      index: "03",
      label: t("values.authentic.label"),
      title: t("values.authentic.title"),
      desc: t("values.authentic.desc"),
    },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <video
            className="h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/videos/hero-perfume-poster.jpg"
            aria-hidden="true"
          >
            <source src="/videos/hero-perfume-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-canvas/60 motion-reduce:bg-canvas" />
          <div className="absolute inset-0 bg-gradient-to-b from-canvas/40 via-transparent to-canvas/85" />
        </div>
        <div className={`${shell} grid w-full items-center justify-items-center gap-14 py-14 md:gap-16 md:py-20 lg:py-24`}>
          <div className="max-w-xl">
            <ScrollReveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-champagne" />
                <span className="eyebrow text-ash">{t("heroBadge")}</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <BlurText
                text={t("heading")}
                delay={140}
                className="mt-7 font-display text-[2.75rem] font-normal leading-[1.02] tracking-[-0.02em] text-ivory sm:text-6xl lg:text-7xl"
              />
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ash">
                {t("tagline")}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Magnet magnetStrength={18}>
                  <Button
                    size="lg"
                    className="h-12 rounded-[4px] px-8 text-[0.8125rem] tracking-[0.02em] hover:bg-brass"
                    asChild
                  >
                    <Link href="/shop">{t("cta")}</Link>
                  </Button>
                </Magnet>
                <Magnet magnetStrength={30}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-[4px] border-border bg-transparent px-8 text-[0.8125rem] tracking-[0.02em] text-ivory shadow-none hover:border-ivory/25 hover:bg-transparent hover:text-champagne"
                    asChild
                  >
                    <Link href="/shop?sort=newest">{t("secondaryCta")}</Link>
                  </Button>
                </Magnet>
              </div>
            </ScrollReveal>
          </div>
        </div>
        <div className={shell}>
          <div className="hairline" />
        </div>
      </section>

      <Suspense fallback={<ProductGridSkeleton />}>
        <FeaturedProducts locale={locale} />
      </Suspense>

      <section className="border-y border-border bg-surface/40">
        <FadeContent blur duration={900}>
          <div className={`${shell} grid gap-10 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28`}>
            <ScrollReveal className="lg:col-span-5">
              <p className="eyebrow text-champagne">{t("editorialEyebrow")}</p>
              <blockquote className="mt-6 font-display text-3xl leading-[1.18] tracking-[-0.01em] text-ivory sm:text-4xl">
                {t("editorialQuote")}
              </blockquote>
            </ScrollReveal>

            <ScrollReveal delay={120} className="lg:col-span-6 lg:col-start-7 lg:pt-12">
              <p className="max-w-lg text-base leading-[1.8] text-ash">
                {t("editorialBody")}
              </p>
              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-3 text-sm text-ivory transition-colors hover:text-champagne"
              >
                {t("editorialLink")}
                <span className="h-px w-8 bg-champagne transition-all duration-300 group-hover:w-12" />
              </Link>
            </ScrollReveal>
          </div>
        </FadeContent>
      </section>

      <section className={`${shell} py-20 lg:py-24`}>
        <ScrollReveal>
          <p className="eyebrow text-taupe">{t("valuesEyebrow")}</p>
        </ScrollReveal>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
          {values.map((item, index) => (
            <ScrollReveal
              key={item.index}
              delay={index * 90}
              className={
                index === 0
                  ? "md:pr-10"
                  : index === 1
                    ? "md:px-10"
                    : "md:pl-10"
              }
            >
              <span className="eyebrow text-champagne">{item.index}</span>
              <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.18em] text-taupe">
                {item.label}
              </p>
              <h3 className="mt-3 font-display text-xl leading-snug text-ivory">
                {item.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ash">
                {item.desc}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <Suspense fallback={<ProductGridSkeleton />}>
        <RecommendedSection locale={locale} />
      </Suspense>

      <section className="border-t border-border">
        <div className={`${shell} py-24 text-center lg:py-32`}>
          <FadeContent blur duration={900}>
            <ScrollReveal>
              <p className="eyebrow text-champagne">{t("ctaBand.eyebrow")}</p>
              <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl leading-[1.15] tracking-[-0.01em] text-ivory sm:text-4xl lg:text-5xl">
                {t("ctaBand.title")}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ash">
                {t("ctaBand.desc")}
              </p>
              <Magnet magnetStrength={22}>
                <Button
                  size="lg"
                  className="mt-10 h-12 rounded-[4px] px-8 text-[0.8125rem] tracking-[0.02em] hover:bg-brass"
                  asChild
                >
                  <Link href="/shop">{t("ctaBand.button")}</Link>
                </Button>
              </Magnet>
            </ScrollReveal>
          </FadeContent>
        </div>
      </section>
    </>
  );
}
