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
import FadeContent from "@/components/react-bits/fade-content";
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
    return <div className="h-96 animate-pulse rounded-[4px] bg-surface" />;
  }

  if (items.length === 0 && !pending) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[4px] border border-border py-20 text-center">
        <p className="text-ash">{t("emptyCart")}</p>
        <Button asChild className="h-11 rounded-[4px] px-7 hover:bg-brass">
          <Link href="/shop">{t("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  const linesJson = JSON.stringify(
    items.map((i) => ({ variantId: i.id, qty: i.qty }))
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="lines" value={linesJson} />
      <input type="hidden" name="method" value={method} />
      <input
        type="hidden"
        name="couponCode"
        value={coupon?.valid ? (coupon.code ?? "") : ""}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <FadeContent blur duration={800}>
          <div className="space-y-8">
            <section className="space-y-4 rounded-[4px] border border-border bg-surface/30 p-5 sm:p-6">
            <h2 className="font-display text-xl text-ivory">{t("shippingAddress")}</h2>
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

          <section className="space-y-3 rounded-[4px] border border-border bg-surface/30 p-5 sm:p-6">
            <h2 className="font-display text-xl text-ivory">{t("paymentMethod")}</h2>
            {methods.map((m) => (
              <label
                key={m}
                className={`flex cursor-pointer items-start gap-3 rounded-[4px] border p-4 transition-colors ${
                  method === m
                    ? "border-champagne/60 bg-champagne/5"
                    : "border-border hover:border-ivory/20 hover:bg-surface/60"
                }`}
              >
                <input
                  type="radio"
                  name="method-radio"
                  checked={method === m}
                  onChange={() => setMethod(m)}
                  className="mt-1 accent-[#C6A664]"
                />
                <span>
                  <span className="block font-medium text-ivory">{t(`methods.${m}`)}</span>
                  <span className="block text-sm text-ash">
                    {t(`methodDesc.${m}`)}
                  </span>
                </span>
              </label>
            ))}
          </section>

          <section className="space-y-3 rounded-[4px] border border-border bg-surface/30 p-5 sm:p-6">
            <h2 className="font-display text-xl text-ivory">{t("couponTitle")}</h2>
            {coupon?.valid ? (
              <div className="flex items-center justify-between rounded-[4px] border border-champagne/40 bg-champagne/10 px-3 py-2 text-sm text-ivory">
                <span>
                  {t("couponApplied", { code: coupon.code ?? "" })} (
                  {formatMMK(coupon.discount)})
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeCoupon}
                  className="text-ash hover:bg-transparent hover:text-ivory"
                >
                  {t("couponRemove")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t("couponPlaceholder")}
                  maxLength={40}
                  aria-label={t("couponTitle")}
                  className="rounded-[4px]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={applyCoupon}
                  disabled={couponPending || !couponInput.trim()}
                  className="h-10 rounded-[4px]"
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
          </div>
        </FadeContent>

        <FadeContent blur duration={800} delay={120}>
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="space-y-3 rounded-[4px] border border-border bg-surface/40 p-5 sm:p-6">
            <p className="eyebrow text-taupe">Order summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-ash">{t("subtotal")}</span>
              <span className="tabular text-ivory">{formatMMK(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ash">{t("shippingFee")}</span>
              <span className="tabular text-ivory">
                {shipping === 0 ? t("freeShipping") : formatMMK(shipping)}
              </span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-sm text-champagne">
                <span>{t("discountLabel")}</span>
                <span className="tabular">-{formatMMK(discount)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="eyebrow text-taupe">{t("total")}</span>
              <span className="tabular font-display text-2xl text-ivory">
                {formatMMK(total)}
              </span>
            </div>
          </section>

          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {t(`errors.${state.error}`)}
            </p>
          ) : null}

          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-[4px] text-[0.8125rem] tracking-[0.02em] hover:bg-brass"
              disabled={pending}
            >
              {pending ? t("placing") : t("placeOrder")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-[4px] border-border bg-transparent text-ivory hover:border-ivory/25 hover:bg-transparent hover:text-champagne"
              asChild
            >
              <Link href="/shop">{t("continueShopping")}</Link>
            </Button>
          </div>
          <p className="px-1 text-xs leading-relaxed text-taupe">
            Your order details are reviewed with care before dispatch.
          </p>
          </aside>
        </FadeContent>
      </div>
    </form>
  );
}
