import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-14">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="leading-relaxed text-muted-foreground">{t("intro")}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-5">
          <h2 className="mb-2 font-medium">{t("email")}</h2>
          <p className="text-sm text-muted-foreground">support@perfumeshop.com</p>
        </div>
        <div className="rounded-lg border p-5">
          <h2 className="mb-2 font-medium">{t("phone")}</h2>
          <p className="text-sm text-muted-foreground">+95 9 000 000 000</p>
        </div>
        <div className="rounded-lg border p-5">
          <h2 className="mb-2 font-medium">{t("address")}</h2>
          <p className="text-sm text-muted-foreground">{t("addressValue")}</p>
        </div>
        <div className="rounded-lg border p-5">
          <h2 className="mb-2 font-medium">{t("hours")}</h2>
          <p className="text-sm text-muted-foreground">{t("hoursValue")}</p>
        </div>
      </section>

      <Button asChild className="w-fit">
        <Link href="/shop">{t("cta")}</Link>
      </Button>
    </div>
  );
}
