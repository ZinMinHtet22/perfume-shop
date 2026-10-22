import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCouponAction,
  toggleCouponActiveAction,
} from "../actions";

export const instant = false;

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toISOString().slice(0, 10);
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  await connection();
  const { ok, err } = await searchParams;

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const messages: Record<string, string> = {
    created: "Coupon created.",
    toggled: "Coupon status updated.",
    notFound: "Coupon not found.",
    codeExists: "That code already exists.",
    invalidCode:
      "Code must be 3-40 chars: letters, numbers, - or _ (auto-uppercased).",
    invalidType: "Type must be PERCENT or FIXED.",
    invalidValue:
      "Value must be a positive integer (≤100 for percent).",
    invalidMinOrder: "Minimum order must be 0 or more.",
    invalidUsageLimit: "Usage limit must be a positive integer.",
    invalidExpiry: "Invalid expiry date.",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <Badge variant="secondary">{coupons.length} total</Badge>
      </div>

      {ok ? (
        <p className="rounded-md border border-green-600/40 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          {messages[ok] ?? "Done."}
        </p>
      ) : null}
      {err ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {messages[err] ?? "Something went wrong."}
        </p>
      ) : null}

      <form
        action={createCouponAction}
        className="grid max-w-3xl gap-4 rounded-lg border p-5 sm:grid-cols-2"
      >
        <h2 className="font-medium sm:col-span-2">Create coupon</h2>
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            name="code"
            required
            maxLength={40}
            placeholder="WELCOME10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            required
            defaultValue="PERCENT"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="PERCENT">Percent (%)</option>
            <option value="FIXED">Fixed (MMK)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            name="value"
            type="number"
            min={1}
            required
            placeholder="10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minOrder">Minimum order (MMK)</Label>
          <Input
            id="minOrder"
            name="minOrder"
            type="number"
            min={0}
            defaultValue={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage limit (blank = unlimited)</Label>
          <Input id="usageLimit" name="usageLimit" type="number" min={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expires at (local date)</Label>
          <Input id="expiresAt" name="expiresAt" type="date" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Create coupon</Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Min order</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                  <td className="px-4 py-3">{coupon.type}</td>
                  <td className="px-4 py-3">
                    {coupon.type === "PERCENT"
                      ? `${coupon.value}%`
                      : formatMMK(coupon.value)}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.minOrder > 0 ? formatMMK(coupon.minOrder) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.usedCount}
                    {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">{formatDate(coupon.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleCouponActiveAction.bind(null, coupon.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
