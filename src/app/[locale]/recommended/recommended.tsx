"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { shuffle } from "@/lib/shuffle";
import { useRecentStore } from "@/store/recent";
import { getRecommendationsAction } from "./actions";

/** How many cards are visible at once. */
const VISIBLE = 8;
/** How often the section reshuffles itself. */
const SHUFFLE_INTERVAL_MS = 5000;
/** Cross-fade duration while the grid swaps. */
const FADE_MS = 400;

/**
 * "Recommended for you" strip on the home page.
 *
 * Renders the server-provided picks immediately, then — once the browser
 * reveals what the visitor has viewed recently — upgrades to products similar
 * to those. Every few seconds it cross-fades to a fresh shuffle of the pool so
 * the section keeps rotating on its own. Guests with no history simply keep
 * the server picks as their pool.
 */
export function RecommendedProducts({
  locale,
  fallback,
}: {
  locale: string;
  fallback: ProductCardData[];
}) {
  const t = useTranslations("Home");
  const [pool, setPool] = useState<ProductCardData[]>(fallback);
  const [shown, setShown] = useState<ProductCardData[]>(() =>
    fallback.slice(0, VISIBLE)
  );
  const [fading, setFading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [pending, startTransition] = useTransition();

  // Latest pool for the timer, without re-creating the timer on every swap.
  const poolRef = useRef(fallback);
  useEffect(() => {
    poolRef.current = pool;
  }, [pool]);

  // Personalised upgrade once we know what the visitor has viewed.
  useEffect(() => {
    const ids = useRecentStore.getState().ids;
    if (ids.length === 0) return;

    startTransition(async () => {
      try {
        const recommendations = await getRecommendationsAction(ids, locale);
        if (recommendations.length > 0) {
          setPool(recommendations);
          setShown(shuffle(recommendations).slice(0, VISIBLE));
          setSeeded(true);
        }
      } catch {
        // Keep the server-provided picks if anything goes wrong.
      }
    });
  }, [locale]);

  // Auto shuffle: fade out, re-pick from the pool, fade back in.
  useEffect(() => {
    let swapTimer: number | null = null;

    const timer = window.setInterval(() => {
      setFading(true);
      swapTimer = window.setTimeout(() => {
        setShown(shuffle(poolRef.current).slice(0, VISIBLE));
        setFading(false);
        swapTimer = null;
      }, FADE_MS);
    }, SHUFFLE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      if (swapTimer !== null) window.clearTimeout(swapTimer);
    };
  }, []);

  if (shown.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <ScrollReveal>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("recTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {seeded ? t("recSubtitle") : t("recFallbackSubtitle")}
              {pending ? ` · ${t("recLoading")}` : ""}
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:block"
          >
            {t("featuredAll")}
          </Link>
        </div>
      </ScrollReveal>
      <div
        className={`grid grid-cols-2 gap-4 transition-opacity duration-500 ease-in-out sm:grid-cols-3 lg:grid-cols-4 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        {shown.map((p, i) => (
          <ScrollReveal key={p.id} delay={(i % 4) * 75}>
            <ProductCard product={p} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
