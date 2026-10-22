import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  reviewPaymentAction,
  runAiCheckAction,
  updateOrderStatusAction,
} from "../../actions";

export const instant = false;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  CREATED: "bg-gray-100 text-gray-700",
  AWAITING_REVIEW: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
  EXPIRED: "bg-red-100 text-red-800",
};

const TRANSITIONS: Record<string, { next: string; label: string; variant: string }[]> = {
  PENDING: [
    { next: "CONFIRMED", label: "Confirm", variant: "bg-indigo-600 text-white" },
    { next: "CANCELLED", label: "Cancel", variant: "bg-red-600 text-white" },
  ],
  AWAITING_PAYMENT: [
    { next: "CONFIRMED", label: "Confirm (manual)", variant: "bg-indigo-600 text-white" },
    { next: "CANCELLED", label: "Cancel", variant: "bg-red-600 text-white" },
  ],
  PAID: [
    { next: "CONFIRMED", label: "Confirm", variant: "bg-indigo-600 text-white" },
  ],
  CONFIRMED: [
    { next: "SHIPPED", label: "Mark shipped", variant: "bg-violet-600 text-white" },
    { next: "CANCELLED", label: "Cancel", variant: "bg-red-600 text-white" },
  ],
  SHIPPED: [
    { next: "DELIVERED", label: "Mark delivered", variant: "bg-green-600 text-white" },
  ],
};

const RULES_STYLES: Record<string, string> = {
  PASS: "bg-green-100 text-green-800",
  WARN: "bg-amber-100 text-amber-800",
  FAIL: "bg-red-100 text-red-800",
  ERROR: "bg-red-100 text-red-800",
};

const AI_STYLES: Record<string, string> = {
  LIKELY_REAL: "bg-green-100 text-green-800",
  SUSPICIOUS: "bg-amber-100 text-amber-800",
  LIKELY_FAKE: "bg-red-100 text-red-800",
  ERROR: "bg-red-100 text-red-800",
  SKIPPED: "bg-gray-100 text-gray-700",
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string; ok?: string }>;
};

export default async function AdminOrderDetailPage({ params, searchParams }: Props) {
  await connection();
  const { id } = await params;
  const sp = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
      payment: {
        include: {
          verifications: { orderBy: { createdAt: "desc" }, take: 3 },
          events: { orderBy: { receivedAt: "desc" }, take: 10 },
        },
      },
    },
  });
  if (!order) notFound();

  const address = order.addressSnapshot as {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
  };

  const payment = order.payment;
  const latestVerification =
    payment?.verifications.find((v) => v.imageUrl === payment.receiptImageUrl) ??
    payment?.verifications[0] ??
    null;
  const needsAiCheck =
    payment?.receiptImageUrl &&
    payment.status === "AWAITING_REVIEW" &&
    (!latestVerification || latestVerification.imageUrl !== payment.receiptImageUrl);

  const backTo = `/admin/orders/${order.id}`;
  const transitions = TRANSITIONS[order.status] ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline">
            ← Orders
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono">{order.orderNo}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] ?? ""}`}
            >
              {order.status}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.createdAt.toLocaleString("en-GB")} · {order.paymentMethod}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {transitions.map((t) => (
            <form key={t.next} action={updateOrderStatusAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="next" value={t.next} />
              <input type="hidden" name="backTo" value={backTo} />
              <button
                type="submit"
                className={`h-9 rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90 ${t.variant}`}
              >
                {t.label}
              </button>
            </form>
          ))}
        </div>
      </div>

      {sp.err ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          Action failed: {sp.err}
        </p>
      ) : null}
      {sp.ok ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Done ({sp.ok}).
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="font-medium">Items</h2>
          <div className="rounded-lg border bg-background">
            <ul className="divide-y text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between px-4 py-3">
                  <span>
                    {item.productName} · {item.sizeMl} ml × {item.qty}
                  </span>
                  <span>{formatMMK(item.priceAtPurchase * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMMK(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatMMK(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatMMK(order.total)}</span>
              </div>
            </div>
          </div>

          <h2 className="font-medium">Customer & shipping</h2>
          <div className="rounded-lg border bg-background p-4 text-sm">
            <p className="font-medium">{order.user.name ?? order.user.email}</p>
            <p className="text-muted-foreground">{order.user.email}</p>
            <p className="text-muted-foreground">{order.user.phone ?? address.phone}</p>
            <p className="mt-2">
              {address.name}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}
              {address.state ? `, ${address.state}` : ""}
            </p>
            {order.note ? (
              <p className="mt-2 rounded-md bg-muted p-2 text-muted-foreground">
                Note: {order.note}
              </p>
            ) : null}
            {order.cancelReason ? (
              <p className="mt-2 text-red-700">Cancel reason: {order.cancelReason}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-medium">Payment</h2>
          {payment ? (
            <div className="space-y-4 rounded-lg border bg-background p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{payment.provider}</Badge>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[payment.status] ?? ""}`}
                >
                  {payment.status}
                </span>
                <span className="font-semibold">{formatMMK(payment.amount)}</span>
              </div>
              {payment.bankRef ? (
                <p className="text-muted-foreground">Bank ref: {payment.bankRef}</p>
              ) : null}
              {payment.adminNote ? (
                <p className="text-muted-foreground">Admin note: {payment.adminNote}</p>
              ) : null}
              {payment.paidAt ? (
                <p className="text-muted-foreground">
                  Paid at: {payment.paidAt.toLocaleString("en-GB")}
                </p>
              ) : null}

              {payment.receiptImageUrl ? (
                <div className="space-y-3">
                  <p className="font-medium">Receipt</p>
                  <div className="relative h-72 w-full max-w-sm rounded-md border">
                    <Image
                      src={payment.receiptImageUrl}
                      alt="Payment receipt"
                      fill
                      sizes="(max-width: 768px) 100vw, 384px"
                      className="rounded-md object-contain"
                    />
                  </div>

                  {latestVerification ? (
                    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                      <p className="font-medium">AI check (latest)</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span
                          className={`rounded-full px-2 py-0.5 font-medium ${RULES_STYLES[latestVerification.rulesVerdict] ?? ""}`}
                        >
                          Rules: {latestVerification.rulesVerdict}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-medium ${AI_STYLES[latestVerification.aiVerdict] ?? ""}`}
                        >
                          AI: {latestVerification.aiVerdict}
                          {latestVerification.confidence != null
                            ? ` (${latestVerification.confidence}%)`
                            : ""}
                        </span>
                        <span className="text-muted-foreground">
                          {latestVerification.aiProvider}
                        </span>
                      </div>
                      <ul className="list-inside list-disc text-xs text-muted-foreground">
                        {(latestVerification.reasons as string[] | null)?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                      {latestVerification.ocrText ? (
                        <details>
                          <summary className="cursor-pointer text-xs text-muted-foreground">
                            OCR text
                          </summary>
                          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-background p-2 text-xs">
                            {latestVerification.ocrText.slice(0, 1500)}
                          </pre>
                        </details>
                      ) : null}
                    </div>
                  ) : null}

                  {needsAiCheck ? (
                    <form action={runAiCheckAction}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <input type="hidden" name="backTo" value={backTo} />
                      <button
                        type="submit"
                        className="h-9 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted"
                      >
                        Run AI check (OCR + rules)
                      </button>
                    </form>
                  ) : null}

                  {payment.status === "AWAITING_REVIEW" ? (
                    <div className="space-y-3 border-t pt-3">
                      <div className="space-y-2">
                        <label
                          htmlFor="adminNote"
                          className="block text-xs font-medium text-muted-foreground"
                        >
                          Admin note (optional)
                        </label>
                        <textarea
                          id="adminNote"
                          name="adminNote"
                          form={`review-${payment.id}`}
                          rows={2}
                          maxLength={500}
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <form id={`review-${payment.id}`} action={reviewPaymentAction}>
                          <input type="hidden" name="paymentId" value={payment.id} />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input type="hidden" name="decision" value="APPROVE" />
                          <button
                            type="submit"
                            className="h-9 rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:opacity-90"
                          >
                            Approve — mark PAID
                          </button>
                        </form>
                        <form action={reviewPaymentAction}>
                          <input type="hidden" name="paymentId" value={payment.id} />
                          <input type="hidden" name="backTo" value={backTo} />
                          <input type="hidden" name="decision" value="REJECT" />
                          <button
                            type="submit"
                            className="h-9 rounded-md border border-red-300 bg-background px-4 text-sm font-medium text-red-700 hover:bg-red-50"
                          >
                            Reject — request new receipt
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-muted-foreground">No receipt uploaded.</p>
              )}

              {payment.events.length > 0 ? (
                <div className="border-t pt-3">
                  <p className="mb-2 font-medium">Events</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {payment.events.map((e) => (
                      <li key={e.id}>
                        {e.receivedAt.toLocaleString("en-GB")} — {e.type}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              No payment record.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
