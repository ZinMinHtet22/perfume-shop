import "dotenv/config";
import { verifyReceipt } from "../src/lib/ai/verify-receipt";
import { prisma } from "../src/lib/prisma";

async function main() {
  const payment = await prisma.payment.findFirst({
    where: { receiptImageUrl: { not: null } },
    include: { order: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!payment) throw new Error("no payment with receipt");

  console.log("testing OCR on", payment.order.orderNo, "amount", payment.amount);
  const started = Date.now();
  const result = await verifyReceipt({
    receiptImageUrl: payment.receiptImageUrl!,
    expectedAmount: payment.amount,
    orderNo: payment.order.orderNo,
    method: payment.provider,
  });
  console.log("took ms:", Date.now() - started);
  console.log("rulesVerdict:", result.rulesVerdict);
  console.log("aiVerdict:", result.aiVerdict, "provider:", result.aiProvider);
  console.log("extracted:", JSON.stringify(result.extracted));
  console.log("reasons:", result.reasons);
  console.log("ocrText length:", result.ocrText.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
