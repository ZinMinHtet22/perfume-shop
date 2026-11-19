import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import FadeContent from "@/components/react-bits/fade-content";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("title") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  const details = [
    { label: t("email"), value: "support@perfumeshop.com" },
    { label: t("phone"), value: "+95 9 000 000 000" },
    { label: t("address"), value: t("addressValue") },
    { label: t("hours"), value: t("hoursValue") },
  ];

  return (
    <div className="mx-auto w-full max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <FadeContent blur duration={900}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow text-champagne">Contact</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ivory sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-md text-base leading-[1.8] text-ash">
              {t("intro")}
            </p>
            <Button
              className="mt-9 h-11 rounded-[4px] px-7 hover:bg-brass"
              asChild
            >
              <Link href="/shop">{t("cta")}</Link>
            </Button>
          </div>

          <dl className="border-y border-border lg:col-span-6 lg:col-start-7">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="grid gap-1 border-b border-border py-5 last:border-b-0 sm:grid-cols-[150px_1fr] sm:gap-6"
              >
                <dt className="eyebrow pt-0.5 text-taupe">{detail.label}</dt>
                <dd className="text-sm leading-relaxed text-ivory">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </FadeContent>
    </div>
  );
}
