"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { CartButton } from "@/components/cart-button";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  my: "MY",
};

export function Navbar({ userName }: { userName?: string | null }) {
  const t = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = useLocale();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/shop", label: t("shop") },
    { href: "/wishlist", label: t("wishlist") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-canvas/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={t("brand")}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
          <span className="eyebrow text-ivory">{t("brand")}</span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative py-1 text-[0.8125rem] tracking-wide transition-colors duration-200",
                isActive(link.href)
                  ? "text-ivory after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-champagne"
                  : "text-ash hover:text-ivory"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <Link
            href={userName ? "/account" : "/login"}
            className="hidden max-w-32 truncate text-[0.8125rem] text-ash transition-colors hover:text-ivory md:inline"
          >
            {userName || t("account")}
          </Link>

          <CartButton />

          <div className="ml-1 flex items-center gap-1 border-l border-border pl-2 sm:pl-3">
            {routing.locales.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => router.replace(pathname, { locale })}
                aria-label={t("switchTo", { locale: LOCALE_LABELS[locale] })}
                aria-current={locale === activeLocale ? "true" : undefined}
                className={cn(
                  "px-1 py-1 text-[0.6875rem] uppercase tracking-[0.14em] transition-colors",
                  locale === activeLocale
                    ? "text-champagne"
                    : "text-taupe hover:text-ivory"
                )}
              >
                {LOCALE_LABELS[locale]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            className="ml-1 flex h-9 w-9 items-center justify-center text-ivory transition-colors hover:text-champagne md:hidden"
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-canvas px-6 pb-8 pt-4 md:hidden"
        >
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "border-b border-border py-4 font-display text-2xl transition-colors",
                  isActive(link.href) ? "text-champagne" : "text-ivory"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={userName ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              className="py-4 font-display text-2xl text-ivory"
            >
              {userName || t("account")}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
