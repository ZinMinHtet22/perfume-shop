import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const instant = false;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminDashboard() {
  await connection();

  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const [ordersToday, revenueAgg, awaitingPayments, products, recentOrders, lowStock] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED"] } },
      }),
      prisma.payment.count({ where: { status: "AWAITING_REVIEW" } }),
      prisma.product.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 }, product: { isActive: true } },
        include: { product: { select: { name: true } } },
        orderBy: { stock: "asc" },
        take: 8,
      }),
    ]);

  const stats = [
    { label: "Orders today", value: String(ordersToday) },
    { label: "Total revenue", value: formatMMK(revenueAgg._sum.total ?? 0) },
    { label: "Receipts to review", value: String(awaitingPayments) },
    { label: "Products", value: String(products) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-background p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="rounded-lg border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Order</th>
                  <th className="px-4 py-2 font-medium">Customer</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-primary hover:underline"
                      >
                        {o.orderNo}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{o.user.name ?? o.user.email}</td>
                    <td className="px-4 py-2">{formatMMK(o.total)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status] ?? ""}`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No orders yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-medium">Low stock (≤ 5)</h2>
          <div className="rounded-lg border bg-background">
            <ul className="divide-y text-sm">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between px-4 py-2.5">
                  <span>
                    {v.product.name} · {v.sizeMl} ml
                  </span>
                  <Badge variant={v.stock === 0 ? "destructive" : "secondary"}>
                    {v.stock}
                  </Badge>
                </li>
              ))}
              {lowStock.length === 0 ? (
                <li className="px-4 py-8 text-center text-muted-foreground">
                  All stock levels healthy.
                </li>
              ) : null}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
