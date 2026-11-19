import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const CURRENT_YEAR = 2026; // Static value: keeps the footer prerenderable with Cache Components.

const linkClass =
  "text-sm text-ash transition-colors duration-200 hover:text-ivory";

export async function Footer() {
  const t = await getTranslations("Footer");

  const shopLinks = [
    { href: "/shop", label: t("allFragrances") },
    { href: "/wishlist", label: t("wishlist") },
    { href: "/cart", label: t("cart") },
  ] as const;

  const careLinks = [
    { href: "/contact", label: t("contact") },
    { href: "/about", label: t("about") },
    { href: "/account", label: t("account") },
  ] as const;

  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto w-full max-w-[1320px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5 lg:pr-16">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
              <span className="eyebrow text-ivory">{t("brand")}</span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ash">
              {t("blurb")}
            </p>
            <p className="eyebrow mt-8 text-taupe">{t("locale")}</p>
          </div>

          <nav className="lg:col-span-2" aria-label={t("shopTitle")}>
            <h2 className="eyebrow text-taupe">{t("shopTitle")}</h2>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2" aria-label={t("careTitle")}>
            <h2 className="eyebrow text-taupe">{t("careTitle")}</h2>
            <ul className="mt-5 space-y-3">
              {careLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="eyebrow text-taupe">{t("contactTitle")}</h2>
            <ul className="mt-5 space-y-3 text-sm text-ash">
              <li>
                <a
                  href="mailto:support@perfumeshop.com"
                  className={linkClass}
                >
                  support@perfumeshop.com
                </a>
              </li>
              <li>
                <a href="tel:+959000000000" className={linkClass}>
                  +95 9 000 000 000
                </a>
              </li>
              <li className="pt-1 leading-relaxed">
                {t("address")}
                <br />
                {t("hours")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-taupe">
            {t("copyright", { year: CURRENT_YEAR })}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li className="text-[0.6875rem] uppercase tracking-[0.14em] text-taupe">
              {t("payKbz")}
            </li>
            <li className="text-[0.6875rem] uppercase tracking-[0.14em] text-taupe">
              {t("payBank")}
            </li>
            <li className="text-[0.6875rem] uppercase tracking-[0.14em] text-taupe">
              {t("payCod")}
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
