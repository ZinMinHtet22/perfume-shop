import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import type { OrderStatus } from "@/generated/prisma/client";

export const instant = false;

const STATUSES: (OrderStatus | "ALL")[] = [
  "ALL",
  "AWAITING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

type Props = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  await connection();
  const params = await searchParams;
  const status = STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : "ALL";
  const q = (params.q ?? "").trim().slice(0, 100);

  const orders = await prisma.order.findMany({
    where: {
      ...(status !== "ALL" ? { status: status as OrderStatus } : {}),
      ...(q
        ? {
            OR: [
              { orderNo: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { user: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      payment: { select: { status: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

      <form className="flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search order no, email, name…"
          className="h-9 w-64 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2"
        />
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={s === "ALL" ? "/admin/orders" : `/admin/orders?status=${s}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground border hover:bg-muted"
              }`}
            >
              {s.replace(/_/g, " ")}
            </Link>
          ))}
        </div>
        <button
          type="submit"
          className="h-9 rounded-md border bg-background px-3 text-sm hover:bg-muted"
        >
          Search
        </button>
      </form>

      <div className="rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Order</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Customer</th>
              <th className="px-4 py-2.5 font-medium">Method</th>
              <th className="px-4 py-2.5 font-medium">Total</th>
              <th className="px-4 py-2.5 font-medium">Payment</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-mono text-primary hover:underline"
                  >
                    {o.orderNo}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {o.createdAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-2.5">{o.user.name ?? o.user.email}</td>
                <td className="px-4 py-2.5">{o.paymentMethod}</td>
                <td className="px-4 py-2.5">{formatMMK(o.total)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {o.payment?.status ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status] ?? ""}`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No orders match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
