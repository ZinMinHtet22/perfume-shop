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
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("orderNo")}: <span className="font-mono">{order.orderNo}</span>
        </p>
        <OrderStatusPoller
          orderNo={order.orderNo}
          initial={{
            orderStatus: order.status,
            paymentStatus: payment.status,
          }}
        />
      </div>

      <section className="space-y-3 rounded-lg border p-5">
        <h2 className="font-medium">{t("orderSummary")}</h2>
        <ul className="divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.productName} · {item.sizeMl} ml × {item.qty}
              </span>
              <span>{formatMMK(item.priceAtPurchase * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span>{formatMMK(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("shippingFee")}</span>
            <span>{order.shipping === 0 ? t("freeShipping") : formatMMK(order.shipping)}</span>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-green-700 dark:text-green-400">
              <span>{t("discountLabel")}</span>
              <span>-{formatMMK(order.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-semibold">
            <span>{t("total")}</span>
            <span>{formatMMK(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-lg border p-5 text-sm">
        <h2 className="font-medium">{t("shipTo")}</h2>
        <p>{address.name}</p>
        <p>{address.phone}</p>
        <p>
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}, {address.city}
          {address.state ? `, ${address.state}` : ""}
        </p>
      </section>

      {order.paymentMethod === "COD" ? (
        <section className="rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
          {t("codNotice")}
        </section>
      ) : null}

      {order.paymentMethod === "KBZPAY" ? (
        <section className="space-y-4 rounded-lg border p-5">
          <h2 className="font-medium">{t("kbzTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("kbzNote")}</p>
          <p className="text-lg font-semibold">
            {t("payAmount")}: {formatMMK(payment.amount)}
          </p>
          {payCfg.kbzpay?.qrImageUrl ? (
            <div className="relative mx-auto h-64 w-64">
              <Image
                src={payCfg.kbzpay.qrImageUrl}
                alt="KBZ Pay QR"
                fill
                sizes="256px"
                className="object-contain"
              />
            </div>
          ) : (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("kbzQrPending")}
            </p>
          )}
        </section>
      ) : null}

      {order.paymentMethod === "BANK" ? (
        <section className="space-y-3 rounded-lg border p-5">
          <h2 className="font-medium">{t("bankTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("bankNote")}</p>
          <p className="text-lg font-semibold">
            {t("payAmount")}: {formatMMK(payment.amount)}
          </p>
          <ul className="space-y-2">
            {(payCfg.bank?.accounts ?? []).map((acc, i) => (
              <li key={i} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{acc.bank}</p>
                <p>{acc.accountName}</p>
                <p className="font-mono">{acc.accountNo}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {payment.receiptImageUrl ? (
        <section className="space-y-3 rounded-lg border p-5">
          <h2 className="font-medium">{t("yourReceipt")}</h2>
          <div className="relative h-64 w-full max-w-sm">
            <Image
              src={payment.receiptImageUrl}
              alt="Receipt"
              fill
              sizes="(max-width: 640px) 100vw, 384px"
              className="rounded-md object-contain"
            />
          </div>
          {payment.bankRef ? (
            <p className="text-sm text-muted-foreground">
              {t("bankRef")}: {payment.bankRef}
            </p>
          ) : null}
          {payment.status === "AWAITING_REVIEW" ? (
            <p className="text-sm text-amber-700">{t("waitingReview")}</p>
          ) : null}
        </section>
      ) : null}

      {showUpload ? <UploadReceipt orderNo={order.orderNo} /> : null}

      {payment.status === "PAID" ? (
        <section className="rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
          {t("paidNotice")}
        </section>
      ) : null}

      <section className="space-y-3 rounded-lg border border-dashed p-5 text-center">
        <p className="text-sm text-muted-foreground">{t("returnNote")}</p>
        <Button variant="outline" size="lg" asChild>
          <Link href="/shop">{t("continueShopping")}</Link>
        </Button>
      </section>
    </div>
  );
}
