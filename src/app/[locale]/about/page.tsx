import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

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
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-14">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="leading-relaxed text-muted-foreground">{t("story1")}</p>
        <p className="leading-relaxed text-muted-foreground">{t("story2")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t("valuesTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["value1", "value2", "value3"] as const).map((key) => (
            <div key={key} className="rounded-lg border p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Button asChild className="w-fit">
        <Link href="/shop">{t("cta")}</Link>
      </Button>
    </div>
  );
}
