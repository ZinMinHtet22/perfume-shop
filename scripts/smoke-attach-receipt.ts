import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const o = await prisma.order.findFirst({
    where: { note: "SMOKE-TEST" },
    include: { payment: true },
  });
  if (!o?.payment) throw new Error("smoke order missing");
  console.log("orderId:", o.id, "orderNo:", o.orderNo, "paymentId:", o.payment.id);

  const dir = path.join(process.cwd(), "uploads", "receipts");
  await mkdir(dir, { recursive: true });
  const filename = "smoke-receipt.png";
  // minimal valid 1x1 png
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );
  await writeFile(path.join(dir, filename), png);

  await prisma.payment.update({
    where: { id: o.payment.id },
    data: { receiptImageUrl: `/api/uploads/receipts/${filename}`, status: "AWAITING_REVIEW" },
  });
  console.log("receipt attached, payment → AWAITING_REVIEW");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
