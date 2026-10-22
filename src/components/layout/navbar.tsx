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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          {t("brand")}
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/shop" className="transition-colors hover:text-foreground">
            {t("shop")}
          </Link>
          <Link href="/wishlist" className="transition-colors hover:text-foreground">
            {t("wishlist")}
          </Link>
          <Link href="/about" className="transition-colors hover:text-foreground">
            {t("about")}
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-foreground"
          >
            {t("contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
            <Link
              href={userName ? "/account" : "/login"}
              className="max-w-40 truncate"
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
              onClick={() => router.replace(pathname, { locale })}
              aria-label={t("switchTo", { locale: LOCALE_LABELS[locale] })}
            >
              {LOCALE_LABELS[locale]}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
}
