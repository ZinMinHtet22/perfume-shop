import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import FadeContent from "@/components/react-bits/fade-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("title") };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <FadeContent blur duration={900}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow text-champagne">The house</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ivory sm:text-5xl">
              {t("title")}
            </h1>
          </div>
          <div className="space-y-6 lg:col-span-7 lg:col-start-6">
            <p className="font-display text-xl leading-[1.55] text-ivory/90 sm:text-2xl">
              {t("story1")}
            </p>
            <p className="text-base leading-[1.8] text-ash">{t("story2")}</p>
          </div>
        </div>
      </FadeContent>

      <FadeContent blur duration={900} delay={100}>
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="eyebrow text-taupe">{t("valuesTitle")}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
            {(["value1", "value2", "value3"] as const).map((key, index) => (
              <div
                key={key}
                className={
                  index === 0
                    ? "md:pr-10"
                    : index === 1
                      ? "md:px-10"
                      : "md:pl-10"
                }
              >
                <span className="eyebrow text-champagne">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-ash">
                  {t(key)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Button
          className="mt-14 h-11 rounded-[4px] px-7 hover:bg-brass"
          asChild
        >
          <Link href="/shop">{t("cta")}</Link>
        </Button>
      </FadeContent>
    </div>
  );
}
