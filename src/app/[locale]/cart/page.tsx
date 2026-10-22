"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-lg font-medium">{t("empty")}</p>
        <Button asChild>
          <Link href="/shop">{t("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          <Trash2 className="mr-1.5 h-4 w-4" /> {t("clear")}
        </Button>
      </div>

      <div className="divide-y rounded-lg border">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.brandName}
                  </p>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.sizeMl} ml</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMMK(item.price * item.qty)}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
              <div className="flex items-center rounded-md border w-fit">
                <button
                  type="button"
                  className="px-2.5 py-1.5 hover:bg-muted"
                  onClick={() => setQty(item.id, item.qty - 1)}
                  aria-label="decrease"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-9 text-center text-sm">{item.qty}</span>
                <button
                  type="button"
                  className="px-2.5 py-1.5 hover:bg-muted"
                  onClick={() => setQty(item.id, item.qty + 1)}
                  aria-label="increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border bg-muted/40 p-4">
        <span className="font-medium">{t("subtotal")}</span>
        <span className="text-xl font-semibold">{formatMMK(cartTotal(items))}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild>
          <Link href="/shop">{t("continueShopping")}</Link>
        </Button>
        <Button size="lg" asChild>
          <Link href="/checkout">{t("checkout")}</Link>
        </Button>
      </div>
    </div>
  );
}
