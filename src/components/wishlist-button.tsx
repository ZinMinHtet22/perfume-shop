"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleWishlistAction } from "@/app/[locale]/wishlist/actions";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialWished,
  className,
}: {
  productId: string;
  initialWished: boolean;
  className?: string;
}) {
  const t = useTranslations("Wishlist");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleWishlistAction(productId, locale);
      if (result.error === "loginRequired") {
        router.push(`/${locale}/login`);
        return;
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={initialWished ? t("remove") : t("add")}
      aria-pressed={initialWished}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-canvas/80 backdrop-blur transition-colors hover:border-champagne/50 hover:bg-surface disabled:opacity-60",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(
          "h-4 w-4",
          initialWished
            ? "fill-champagne text-champagne"
            : "fill-none text-ivory"
        )}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
