"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/cart-button";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  my: "MY",
};

export function Navbar({ userName }: { userName?: string | null }) {
  const t = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = useLocale();

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between gap-3 rounded-full border border-white/[0.08] bg-[#0a0a0a]/80 px-5 backdrop-blur-md">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c9a227] shadow-[0_0_12px_#c9a227]" />
          <span className="text-xs font-medium uppercase tracking-wider">
            {t("brand")}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-xs tracking-wide text-muted-foreground md:flex">
          <Link href="/shop" className="transition-colors hover:text-foreground">
            {t("shop")}
          </Link>
          <Link href="/wishlist" className="transition-colors hover:text-foreground">
            {t("wishlist")}
          </Link>
          <Link href="/about" className="transition-colors hover:text-foreground">
            {t("about")}
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            {t("contact")}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="sm" asChild className="hidden text-xs md:inline-flex">
            <Link
              href={userName ? "/account" : "/login"}
              className="max-w-32 truncate"
            >
              {userName || t("account")}
            </Link>
          </Button>
          <CartButton />
          {routing.locales.map((locale) => (
            <Button
              key={locale}
              size="sm"
              variant={locale === activeLocale ? "secondary" : "ghost"}
              className="text-xs"
              onClick={() => router.replace(pathname, { locale })}
              aria-label={t("switchTo", { locale: LOCALE_LABELS[locale] })}
            >
              {LOCALE_LABELS[locale]}
            </Button>
          ))}
        </div>
      </nav>
    </header>
  );
}
