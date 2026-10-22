"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type UploadResult = { error: string | null; ok?: boolean };

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MAX_SIZE = 8 * 1024 * 1024;

export async function uploadReceiptAction(
  formData: FormData
): Promise<UploadResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "loginRequired" };
  }

  const orderNo = String(formData.get("orderNo") ?? "");
  const bankRefRaw = String(formData.get("bankRef") ?? "").slice(0, 100);
  const file = formData.get("file");

  if (!orderNo || !(file instanceof File) || file.size === 0) {
    return { error: "invalidInput" };
  }
  if (file.size > MAX_SIZE) {
    return { error: "fileTooLarge" };
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return { error: "invalidFileType" };
  }

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { payment: true },
  });
  if (!order || order.userId !== session.user.id) {
    return { error: "notFound" };
  }
  const payment = order.payment;
  if (!payment) {
    return { error: "notFound" };
  }
  if (payment.status === "PAID") {
    return { error: "alreadyPaid" };
  }
  if (payment.status === "AWAITING_REVIEW") {
    return { error: "alreadyUploaded" };
  }

  const parsedOrderNo = z.string().regex(/^[A-Za-z0-9-]+$/).safeParse(orderNo);
  if (!parsedOrderNo.success) {
    return { error: "invalidInput" };
  }

  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "uploads", "receipts");
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  const receiptImageUrl = `/api/uploads/receipts/${filename}`;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "AWAITING_REVIEW",
        receiptImageUrl,
        bankRef: bankRefRaw || null,
      },
    }),
    prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        type: "UPLOAD",
        payload: {
          filename,
          size: file.size,
          mime: file.type,
          bankRef: bankRefRaw || null,
        },
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "AWAITING_PAYMENT" },
    }),
  ]);

  return { error: null, ok: true };
}
