import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@perfumeshop.com" },
  });
  if (!user) throw new Error("demo user missing");

  const variant = await prisma.productVariant.findFirst({
    where: { stock: { gte: 1 } },
    include: { product: true },
  });
  if (!variant) throw new Error("no variant with stock");

  const existing = await prisma.order.findFirst({
    where: { userId: user.id, note: "SMOKE-TEST" },
  });
  if (existing) {
    console.log("existing order:", existing.orderNo);
    return;
  }

  const subtotal = variant.price;
  const shipping = subtotal >= 150000 ? 0 : 3000;
  const total = subtotal + shipping;

  const orderNo = `PF-SMOKE-${Date.now().toString(36).toUpperCase()}`;
  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        orderNo,
        userId: user.id,
        status: "AWAITING_PAYMENT",
        paymentMethod: "BANK",
        subtotal,
        tax: 0,
        shipping,
        discount: 0,
        total,
        addressSnapshot: {
          name: "Smoke Tester",
          phone: "0912345678",
          line1: "123 Test Street",
          city: "Yangon",
          country: "MM",
        },
        note: "SMOKE-TEST",
        items: {
          create: [
            {
              variantId: variant.id,
              productName: variant.product.name,
              sizeMl: variant.sizeMl,
              priceAtPurchase: variant.price,
              qty: 1,
            },
          ],
        },
      },
    });
    await tx.payment.create({
      data: {
        orderId: o.id,
        provider: "BANK",
        status: "PENDING",
        amount: total,
        currency: "MMK",
        merchOrderId: orderNo,
      },
    });
    return o;
  });
  console.log("created order:", order.orderNo, "total:", order.total);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
