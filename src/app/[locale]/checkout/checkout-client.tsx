"use client";

import {
  useActionState,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore, cartTotal } from "@/store/cart";
import { formatMMK } from "@/lib/format";
import {
  createCheckoutAction,
  validateCouponAction,
  type CheckoutResult,
  type CouponCheckResult,
} from "./actions";

const emptySubscribe = () => () => {};

type Method = "KBZPAY" | "BANK" | "COD";

export function CheckoutClient({
  locale,
  methods,
  feeMmk,
  freeOverMmk,
  defaultName,
  defaultPhone,
}: {
  locale: string;
  methods: Method[];
  feeMmk: number;
  freeOverMmk: number;
  defaultName: string;
  defaultPhone: string;
}) {
  const t = useTranslations("Checkout");
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [method, setMethod] = useState<Method>(methods[0] ?? "COD");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponCheckResult | null>(null);
  const [couponPending, startCouponCheck] = useTransition();

  const [state, formAction, pending] = useActionState<CheckoutResult, FormData>(
    async (prev, formData) => {
      const result = await createCheckoutAction(prev, formData);
      if (!result.error) {
        clearCart();
      }
      return result;
    },
    { error: null }
  );

  const subtotal = useMemo(() => cartTotal(items), [items]);
  const shipping = subtotal >= freeOverMmk || subtotal === 0 ? 0 : feeMmk;
  const discount = coupon?.valid ? Math.min(coupon.discount, subtotal) : 0;
  const total = Math.max(subtotal + shipping - discount, 0);

  const applyCoupon = () => {
    startCouponCheck(async () => {
      const result = await validateCouponAction(couponInput, subtotal);
      setCoupon(result);
    });
  };

  const removeCoupon = () => {
    setCouponInput("");
    setCoupon(null);
  };

  if (!mounted) {
    return <div className="h-96 animate-pulse rounded-lg bg-muted" />;
  }

  if (items.length === 0 && !pending) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border py-16 text-center">
        <p className="text-muted-foreground">{t("emptyCart")}</p>
        <Button asChild>
          <Link href="/shop">{t("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  const linesJson = JSON.stringify(
    items.map((i) => ({ variantId: i.id, qty: i.qty }))
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="lines" value={linesJson} />
      <input type="hidden" name="method" value={method} />
      <input
        type="hidden"
        name="couponCode"
        value={coupon?.valid ? (coupon.code ?? "") : ""}
      />

      <section className="space-y-4 rounded-lg border p-5">
        <h2 className="font-medium">{t("shippingAddress")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" required defaultValue={defaultName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              minLength={6}
              defaultValue={defaultPhone}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="line1">{t("line1")}</Label>
            <Input id="line1" name="line1" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="line2">{t("line2")}</Label>
            <Input id="line2" name="line2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Input id="city" name="city" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">{t("state")}</Label>
            <Input id="state" name="state" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">{t("note")}</Label>
          <Textarea id="note" name="note" rows={2} maxLength={500} />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border p-5">
        <h2 className="font-medium">{t("paymentMethod")}</h2>
        {methods.map((m) => (
          <label
            key={m}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${
              method === m ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="method-radio"
              checked={method === m}
              onChange={() => setMethod(m)}
              className="mt-1"
            />
            <span>
              <span className="block font-medium">{t(`methods.${m}`)}</span>
              <span className="block text-sm text-muted-foreground">
                {t(`methodDesc.${m}`)}
              </span>
            </span>
          </label>
        ))}
      </section>

      <section className="space-y-3 rounded-lg border p-5">
        <h2 className="font-medium">{t("couponTitle")}</h2>
        {coupon?.valid ? (
          <div className="flex items-center justify-between rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm">
            <span>
              {t("couponApplied", { code: coupon.code ?? "" })} (
              {formatMMK(coupon.discount)})
            </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
              >
                {t("couponRemove")}
              </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder={t("couponPlaceholder")}
              maxLength={40}
              aria-label={t("couponTitle")}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={applyCoupon}
              disabled={couponPending || !couponInput.trim()}
            >
              {couponPending ? t("couponChecking") : t("couponApply")}
            </Button>
          </div>
        )}
        {coupon && !coupon.valid && coupon.error ? (
          <p className="text-sm text-destructive">
            {t(`couponErrors.${coupon.error}`)}
          </p>
        ) : null}
      </section>

      <section className="space-y-2 rounded-lg border bg-muted/30 p-5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span>{formatMMK(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("shippingFee")}</span>
          <span>{shipping === 0 ? t("freeShipping") : formatMMK(shipping)}</span>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
            <span>{t("discountLabel")}</span>
            <span>-{formatMMK(discount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>{t("total")}</span>
          <span>{formatMMK(total)}</span>
        </div>
      </section>

      {state.error ? (
        <p className="text-sm text-destructive">{t(`errors.${state.error}`)}</p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t("placing") : t("placeOrder")}
      </Button>
    </form>
  );
}
