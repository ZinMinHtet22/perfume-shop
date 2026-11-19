import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { OrderStatusPoller } from "./status-poller";
import { UploadReceipt } from "./upload-receipt";

export const instant = false;

type Props = {
  params: Promise<{ locale: string; orderNo: string }>;
};

export default async function PayPage({ params }: Props) {
  await connection();
  const { locale, orderNo } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Pay");

  const [order, paymentSetting] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNo },
      include: { items: true, payment: true },
    }),
    prisma.siteSetting.findUnique({ where: { key: "paymentMethods" } }),
  ]);

  if (!order || !order.payment) {
    notFound();
  }

  const payCfg = (paymentSetting?.value ?? {}) as {
    kbzpay?: { qrImageUrl?: string };
    bank?: { accounts?: { bank: string; accountName: string; accountNo: string }[] };
  };

  const address = order.addressSnapshot as {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
  };

  const payment = order.payment;
  const showUpload =
    order.paymentMethod !== "COD" &&
    payment.status !== "PAID" &&
    payment.status !== "AWAITING_REVIEW";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-14 lg:py-20">
      <div className="space-y-3 border-b border-border pb-6">
        <p className="eyebrow text-champagne">Payment</p>
        <h1 className="font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ivory">
          {t("title")}
        </h1>
        <p className="text-sm text-ash">
          {t("orderNo")}: <span className="font-mono text-ivory">{order.orderNo}</span>
        </p>
        <OrderStatusPoller
          orderNo={order.orderNo}
          initial={{
            orderStatus: order.status,
            paymentStatus: payment.status,
          }}
        />
      </div>

      <section className="space-y-3 rounded-[4px] border border-border bg-surface/30 p-5 sm:p-6">
        <h2 className="font-display text-xl text-ivory">{t("orderSummary")}</h2>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-ash">
                {item.productName} · {item.sizeMl} ml × {item.qty}
              </span>
              <span className="tabular shrink-0 text-ivory">
                {formatMMK(item.priceAtPurchase * item.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ash">{t("subtotal")}</span>
            <span className="tabular text-ivory">{formatMMK(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ash">{t("shippingFee")}</span>
            <span className="tabular text-ivory">
              {order.shipping === 0 ? t("freeShipping") : formatMMK(order.shipping)}
            </span>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-champagne">
              <span>{t("discountLabel")}</span>
              <span className="tabular">-{formatMMK(order.discount)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="eyebrow text-taupe">{t("total")}</span>
            <span className="tabular font-display text-2xl text-ivory">
              {formatMMK(order.total)}
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-[4px] border border-border bg-surface/30 p-5 text-sm sm:p-6">
        <h2 className="font-display text-xl text-ivory">{t("shipTo")}</h2>
        <div className="mt-2 space-y-1 text-ash">
          <p className="text-ivory">{address.name}</p>
          <p>{address.phone}</p>
          <p>
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city}
            {address.state ? `, ${address.state}` : ""}
          </p>
        </div>
      </section>

      {order.paymentMethod === "COD" ? (
        <section className="rounded-[4px] border border-champagne/30 bg-champagne/10 p-5 text-sm text-ivory">
          {t("codNotice")}
        </section>
      ) : null}

      {order.paymentMethod === "KBZPAY" ? (
        <section className="space-y-4 rounded-[4px] border border-border bg-surface/30 p-5 sm:p-6">
          <h2 className="font-display text-xl text-ivory">{t("kbzTitle")}</h2>
          <p className="text-sm text-ash">{t("kbzNote")}</p>
          <p className="font-display text-2xl text-ivory">
            {t("payAmount")}: <span className="tabular">{formatMMK(payment.amount)}</span>
          </p>
          {payCfg.kbzpay?.qrImageUrl ? (
            <div className="relative mx-auto h-64 w-64 rounded-[4px] border border-border bg-canvas p-3">
              <Image
                src={payCfg.kbzpay.qrImageUrl}
                alt="KBZ Pay QR"
                fill
                sizes="256px"
                className="object-contain"
              />
            </div>
          ) : (
            <p className="rounded-[4px] border border-dashed border-border p-6 text-center text-sm text-ash">
              {t("kbzQrPending")}
            </p>
          )}
        </section>
      ) : null}

      {order.paymentMethod === "BANK" ? (
        <section className="space-y-3 rounded-[4px] border border-border bg-surface/30 p-5 sm:p-6">
          <h2 className="font-display text-xl text-ivory">{t("bankTitle")}</h2>
          <p className="text-sm text-ash">{t("bankNote")}</p>
          <p className="font-display text-2xl text-ivory">
            {t("payAmount")}: <span className="tabular">{formatMMK(payment.amount)}</span>
          </p>
          <ul className="space-y-2">
            {(payCfg.bank?.accounts ?? []).map((acc, i) => (
              <li key={i} className="rounded-[4px] border border-border bg-canvas/40 p-4 text-sm">
                <p className="font-medium text-ivory">{acc.bank}</p>
                <p className="text-ash">{acc.accountName}</p>
                <p className="font-mono text-ivory">{acc.accountNo}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {payment.receiptImageUrl ? (
        <section className="space-y-3 rounded-[4px] border border-border bg-surface/30 p-5 sm:p-6">
          <h2 className="font-display text-xl text-ivory">{t("yourReceipt")}</h2>
          <div className="relative h-64 w-full max-w-sm overflow-hidden rounded-[4px] border border-border bg-canvas">
            <Image
              src={payment.receiptImageUrl}
              alt="Receipt"
              fill
              sizes="(max-width: 640px) 100vw, 384px"
              className="object-contain"
            />
          </div>
          {payment.bankRef ? (
            <p className="text-sm text-ash">
              {t("bankRef")}: <span className="text-ivory">{payment.bankRef}</span>
            </p>
          ) : null}
          {payment.status === "AWAITING_REVIEW" ? (
            <p className="text-sm text-champagne">{t("waitingReview")}</p>
          ) : null}
        </section>
      ) : null}

      {showUpload ? <UploadReceipt orderNo={order.orderNo} /> : null}

      {payment.status === "PAID" ? (
        <section className="rounded-[4px] border border-champagne/30 bg-champagne/10 p-5 text-sm text-ivory">
          {t("paidNotice")}
        </section>
      ) : null}

      <section className="space-y-3 rounded-[4px] border border-dashed border-border p-6 text-center">
        <p className="text-sm text-ash">{t("returnNote")}</p>
        <Button
          variant="outline"
          size="lg"
          asChild
          className="h-11 rounded-[4px] border-border bg-transparent text-ivory hover:border-ivory/25 hover:bg-transparent hover:text-champagne"
        >
          <Link href="/shop">{t("continueShopping")}</Link>
        </Button>
      </section>
    </div>
  );
}
