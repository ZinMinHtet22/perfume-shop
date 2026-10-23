"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("unauthorized");
  }
}

const QR_MAX_BYTES = 8 * 1024 * 1024;
const QR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

type PaymentMethodsValue = {
  kbzpay?: {
    enabled?: boolean;
    mode?: string;
    qrImageUrl?: string;
  };
  bank?: {
    enabled?: boolean;
    accounts?: Array<Record<string, string>>;
  };
  cod?: {
    enabled?: boolean;
    feeMmk?: number;
  };
};

export async function savePaymentSettingsAction(
  formData: FormData
): Promise<void> {
  await requireAdmin().catch(() => redirect("/login"));

  const kbzEnabled = formData.get("kbzEnabled") === "on";
  const bankEnabled = formData.get("bankEnabled") === "on";
  const codEnabled = formData.get("codEnabled") === "on";
  const qrFile = formData.get("qrFile");

  const existing = await prisma.siteSetting.findUnique({
    where: { key: "paymentMethods" },
  });
  const prev = (existing?.value ?? {}) as PaymentMethodsValue;

  let qrImageUrl = prev.kbzpay?.qrImageUrl ?? "";

  if (qrFile instanceof File && qrFile.size > 0) {
    const ext = QR_EXTENSIONS[qrFile.type];
    if (!ext) {
      redirect("/admin/settings?err=qrType");
    }
    if (qrFile.size > QR_MAX_BYTES) {
      redirect("/admin/settings?err=qrSize");
    }
    const bytes = Buffer.from(await qrFile.arrayBuffer());
    const fileName = `${randomUUID()}${ext}`;
    const dir = path.join(process.cwd(), "uploads", "qr");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), bytes);
    qrImageUrl = `/api/uploads/qr/${fileName}`;
  }

  const value: PaymentMethodsValue = {
    kbzpay: {
      enabled: kbzEnabled,
      mode: "STATIC_QR",
      qrImageUrl,
    },
    bank: {
      enabled: bankEnabled,
      accounts: prev.bank?.accounts ?? [],
    },
    cod: {
      enabled: codEnabled,
      feeMmk: prev.cod?.feeMmk ?? 0,
    },
  };

  await prisma.siteSetting.upsert({
    where: { key: "paymentMethods" },
    create: { key: "paymentMethods", value },
    update: { value },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/en/checkout");
  revalidatePath("/my/checkout");
  redirect("/admin/settings?ok=1");
}
