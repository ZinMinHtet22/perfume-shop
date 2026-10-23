import { connection } from "next/server";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savePaymentSettingsAction } from "./actions";

export const instant = false;

type PaymentMethodsValue = {
  kbzpay?: {
    enabled?: boolean;
    mode?: string;
    qrImageUrl?: string;
  };
  bank?: {
    enabled?: boolean;
    accounts?: Array<{
      bank?: string;
      accountName?: string;
      accountNo?: string;
    }>;
  };
  cod?: {
    enabled?: boolean;
    feeMmk?: number;
  };
};

const ERRORS: Record<string, string> = {
  qrType: "QR image must be JPG, PNG, or WebP.",
  qrSize: "QR image must be smaller than 8 MB.",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  await connection();
  const { ok, err } = await searchParams;

  const setting = await prisma.siteSetting.findUnique({
    where: { key: "paymentMethods" },
  });
  const cfg = (setting?.value ?? {}) as PaymentMethodsValue;
  const kbz = cfg.kbzpay ?? {};
  const bank = cfg.bank ?? {};
  const cod = cfg.cod ?? {};
  const accounts = bank.accounts ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Payment methods shown at checkout and on the pay page.
        </p>
      </div>

      {ok ? (
        <p className="rounded-md border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-700">
          Payment settings saved.
        </p>
      ) : null}
      {err && ERRORS[err] ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {ERRORS[err]}
        </p>
      ) : null}

      <form
        action={savePaymentSettingsAction}
        className="space-y-8 rounded-lg border p-6"
      >
        <div className="space-y-4">
          <h2 className="font-medium">KBZ Pay</h2>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="kbzEnabled"
              defaultChecked={kbz.enabled !== false}
              className="h-4 w-4"
            />
            Enable KBZ Pay at checkout
          </label>

          <div className="space-y-2">
            <Label htmlFor="qrFile">Merchant QR code</Label>
            <p className="text-sm text-muted-foreground">
              Upload the QR image customers scan with their KBZPay app to
              transfer the order amount. After paying, they upload the transfer
              screenshot as a receipt for admin approval.
            </p>
            {kbz.qrImageUrl ? (
              <div className="relative h-48 w-48 overflow-hidden rounded-md border bg-white">
                <Image
                  src={kbz.qrImageUrl}
                  alt="Current KBZ Pay QR"
                  fill
                  sizes="192px"
                  className="object-contain"
                />
              </div>
            ) : (
              <p className="w-fit rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
                No QR uploaded yet — customers will see &quot;coming soon&quot;.
              </p>
            )}
            <Input
              id="qrFile"
              name="qrFile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h2 className="font-medium">Bank transfer</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="bankEnabled"
              defaultChecked={bank.enabled !== false}
              className="h-4 w-4"
            />
            Enable bank transfer at checkout
          </label>
          {accounts.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {accounts.map((acc, i) => (
                <li key={i} className="rounded-md border p-3">
                  <p className="font-medium">{acc.bank}</p>
                  <p>{acc.accountName}</p>
                  <p className="font-mono">{acc.accountNo}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No bank accounts configured.
            </p>
          )}
        </div>

        <div className="space-y-3 border-t pt-4">
          <h2 className="font-medium">Cash on delivery</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="codEnabled"
              defaultChecked={cod.enabled !== false}
              className="h-4 w-4"
            />
            Enable cash on delivery at checkout
          </label>
        </div>

        <Button type="submit">Save payment settings</Button>
      </form>
    </div>
  );
}
