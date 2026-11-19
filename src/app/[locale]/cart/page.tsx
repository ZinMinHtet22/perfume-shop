"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeContent from "@/components/react-bits/fade-content";
import { useCartStore, cartTotal } from "@/store/cart";
import { formatMMK } from "@/lib/format";

const emptySubscribe = () => () => {};

export default function CartPage() {
  const t = useTranslations("Cart");
  const items = useCartStore((state) => state.items);
  const setQty = useCartStore((state) => state.setQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="h-64 animate-pulse rounded-[4px] bg-surface" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-28 text-center">
        <p className="eyebrow text-champagne">Cart</p>
        <p className="font-display text-3xl text-ivory">{t("empty")}</p>
        <Button asChild className="h-11 rounded-[4px] px-7 hover:bg-brass">
          <Link href="/shop">{t("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  const total = cartTotal(items);
  const itemCount = items.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
      <FadeContent blur duration={700}>
        <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-champagne">Your selection</p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ivory sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-ash">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="w-fit text-ash hover:bg-surface hover:text-ivory"
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> {t("clear")}
          </Button>
        </div>
      </FadeContent>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <FadeContent blur duration={800} delay={80}>
          <div className="divide-y divide-border rounded-[4px] border border-border bg-surface/20">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 sm:p-6">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[4px] border border-border bg-surface sm:h-32 sm:w-32">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 112px, 128px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow text-taupe">{item.brandName}</p>
                    <Link
                      href={`/product/${item.slug}`}
                      className="mt-1 block font-display text-xl leading-snug text-ivory transition-colors hover:text-champagne"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-ash">{item.sizeMl} ml</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular font-medium text-ivory">
                      {formatMMK(item.price * item.qty)}
                    </p>
                    <p className="mt-0.5 text-xs text-taupe">
                      {formatMMK(item.price)} each
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex w-fit items-center rounded-[4px] border border-border">
                    <button
                      type="button"
                      className="px-3 py-2 text-ash transition-colors hover:bg-surface hover:text-ivory"
                      onClick={() => setQty(item.id, item.qty - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="tabular w-10 border-x border-border py-2 text-center text-sm text-ivory">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-2 text-ash transition-colors hover:bg-surface hover:text-ivory"
                      onClick={() => setQty(item.id, item.qty + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-taupe underline-offset-4 transition-colors hover:text-destructive hover:underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        </FadeContent>

        <FadeContent blur duration={800} delay={140}>
          <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-[4px] border border-border bg-surface/40 p-5 sm:p-6">
            <p className="eyebrow text-taupe">Order summary</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ash">{t("subtotal")}</span>
                <span className="tabular text-ivory">{formatMMK(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Shipping</span>
                <span className="text-ivory">Calculated at checkout</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="eyebrow text-taupe">Total</span>
              <span className="tabular font-display text-2xl text-ivory">
                {formatMMK(total)}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              <Button
                size="lg"
                asChild
                className="h-12 w-full rounded-[4px] text-[0.8125rem] tracking-[0.02em] hover:bg-brass"
              >
                <Link href="/checkout">{t("checkout")}</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-11 w-full rounded-[4px] border-border bg-transparent text-ivory hover:border-ivory/25 hover:bg-transparent hover:text-champagne"
              >
                <Link href="/shop">{t("continueShopping")}</Link>
              </Button>
            </div>
          </div>
          <p className="px-1 text-xs leading-relaxed text-taupe">
            Secure checkout. KBZ Pay, bank transfer, and cash on delivery available.
          </p>
          </aside>
        </FadeContent>
      </div>
    </div>
  );
}
