import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { reviewPaymentAction, runAiCheckAction } from "../actions";

export const instant = false;

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
  searchParams: Promise<{ err?: string; ok?: string; tab?: string }>;
};

export default async function AdminReceiptsPage({ searchParams }: Props) {
  await connection();
  const sp = await searchParams;
  const tab = sp.tab === "history" ? "history" : "queue";

  const payments =
    tab === "queue"
      ? await prisma.payment.findMany({
          where: { status: "AWAITING_REVIEW", receiptImageUrl: { not: null } },
          orderBy: { updatedAt: "asc" },
          take: 50,
          include: {
            order: { select: { orderNo: true, id: true, total: true } },
            verifications: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        })
      : await prisma.payment.findMany({
          where: { status: { in: ["PAID", "PENDING"] }, receiptImageUrl: { not: null } },
          orderBy: { updatedAt: "desc" },
          take: 50,
          include: {
            order: { select: { orderNo: true, id: true, total: true } },
            verifications: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Receipt review</h1>
        <div className="flex gap-1 text-sm">
          <Link
            href="/admin/receipts"
            className={`rounded-full px-3 py-1 font-medium ${tab === "queue" ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground"}`}
          >
            Queue
          </Link>
          <Link
            href="/admin/receipts?tab=history"
            className={`rounded-full px-3 py-1 font-medium ${tab === "history" ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground"}`}
          >
            History
          </Link>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {payments.map((p) => {
          const v = p.verifications[0] ?? null;
          const backTo = `/admin/receipts${tab === "history" ? "?tab=history" : ""}`;
          return (
            <div key={p.id} className="space-y-3 rounded-lg border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/admin/orders/${p.order.id}`}
                    className="font-mono text-sm text-primary hover:underline"
                  >
                    {p.order.orderNo}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.provider} · updated {p.updatedAt.toLocaleString("en-GB")}
                  </p>
                </div>
                <span className="font-semibold">{formatMMK(p.amount)}</span>
              </div>

              {p.receiptImageUrl ? (
                <div className="relative h-56 w-full rounded-md border bg-muted/30">
                  <Image
                    src={p.receiptImageUrl}
                    alt={`Receipt ${p.order.orderNo}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="rounded-md object-contain"
                  />
                </div>
              ) : null}

              {v ? (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${RULES_STYLES[v.rulesVerdict] ?? ""}`}
                  >
                    Rules: {v.rulesVerdict}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${AI_STYLES[v.aiVerdict] ?? ""}`}
                  >
                    AI: {v.aiVerdict}
                    {v.confidence != null ? ` (${v.confidence}%)` : ""}
                  </span>
                  {v.reviewStatus !== "PENDING" ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                      {v.reviewStatus}
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No AI check yet.</p>
              )}

              {p.status === "AWAITING_REVIEW" ? (
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  {!v || v.imageUrl !== p.receiptImageUrl ? (
                    <form action={runAiCheckAction}>
                      <input type="hidden" name="paymentId" value={p.id} />
                      <input type="hidden" name="backTo" value={backTo} />
                      <button
                        type="submit"
                        className="h-8 rounded-md border bg-background px-3 text-xs font-medium hover:bg-muted"
                      >
                        Run AI check
                      </button>
                    </form>
                  ) : null}
                  <form action={reviewPaymentAction}>
                    <input type="hidden" name="paymentId" value={p.id} />
                    <input type="hidden" name="backTo" value={backTo} />
                    <input type="hidden" name="decision" value="APPROVE" />
                    <button
                      type="submit"
                      className="h-8 rounded-md bg-green-600 px-3 text-xs font-medium text-white hover:opacity-90"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={reviewPaymentAction}>
                    <input type="hidden" name="paymentId" value={p.id} />
                    <input type="hidden" name="backTo" value={backTo} />
                    <input type="hidden" name="decision" value="REJECT" />
                    <button
                      type="submit"
                      className="h-8 rounded-md border border-red-300 bg-background px-3 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          );
        })}
        {payments.length === 0 ? (
          <p className="col-span-full rounded-lg border bg-background py-16 text-center text-muted-foreground">
            {tab === "queue" ? "No receipts waiting for review." : "No review history yet."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
