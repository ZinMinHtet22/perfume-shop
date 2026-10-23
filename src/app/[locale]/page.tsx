import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FeaturedProducts } from "./featured-products";

type Props = {
  params: Promise<{ locale: string }>;
};

function BentoCard({
  index,
  label,
  accent,
  title,
  desc,
  className = "",
}: {
  index: string;
  label: string;
  accent?: boolean;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-8 transition-colors duration-300 hover:border-[#c9a227]/30 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <span
        className={`text-[11px] uppercase tracking-[0.18em] ${accent ? "text-[#c9a227]" : "text-zinc-500"}`}
      >
        {`${index} // ${label}`}
      </span>
      <h3 className="mt-4 font-display text-2xl font-medium text-zinc-100">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{desc}</p>
    </div>
  );
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.08),transparent_70%)]" />
        <div className="hero-glow pointer-events-none absolute inset-0 [background:radial-gradient(45%_40%_at_72%_38%,rgba(201,162,39,0.22),transparent_70%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-10 pb-24 md:grid-cols-2">
          <div className="space-y-6">
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-[11px] uppercase tracking-[0.2em] text-[#e6c86a]">
                {t("heroBadge")}
              </span>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h1 className="bg-gradient-to-r from-[#f4ece1] via-[#e6c86a] to-[#c9a227] bg-clip-text font-display text-5xl font-medium leading-[1.05] tracking-[-0.04em] text-transparent sm:text-6xl lg:text-7xl">
                {t("heading")}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                {t("tagline")}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  size="lg"
                  className="rounded-full bg-[#c9a227] text-[#1a140c] transition-all duration-300 hover:bg-[#e6c86a] hover:shadow-[0_0_28px_rgba(201,162,39,0.45)]"
                  asChild
                >
                  <Link href="/shop">{t("cta")}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/10 bg-[#0a0a0a] text-zinc-300 transition-colors duration-300 hover:border-white/25 hover:text-white"
                  asChild
                >
                  <Link href="/shop">{t("secondaryCta")}</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
          <HeroCanvas />
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-16 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        }
      >
        <FeaturedProducts locale={locale} />
      </Suspense>

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-16 md:grid-cols-12">
          <ScrollReveal className="md:col-span-7">
            <BentoCard
              index="01"
              label="Payment"
              accent
              title={t("values.pay.title")}
              desc={t("values.pay.desc")}
            />
          </ScrollReveal>
          <ScrollReveal delay={100} className="md:col-span-5">
            <BentoCard
              index="02"
              label="Delivery"
              title={t("values.delivery.title")}
              desc={t("values.delivery.desc")}
            />
          </ScrollReveal>
          <ScrollReveal delay={200} className="md:col-span-12">
            <BentoCard
              index="03"
              label="Authenticity"
              title={t("values.authentic.title")}
              desc={t("values.authentic.desc")}
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] px-8 py-14 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="font-display text-2xl font-medium tracking-tight text-zinc-100 sm:text-3xl">
              {t("ctaBand.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-zinc-400">
              {t("ctaBand.desc")}
            </p>
            <Button
              size="lg"
              className="mt-8 rounded-full bg-[#c9a227] text-[#1a140c] transition-all duration-300 hover:bg-[#e6c86a] hover:shadow-[0_0_28px_rgba(201,162,39,0.45)]"
              asChild
            >
              <Link href="/shop">{t("ctaBand.button")}</Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
