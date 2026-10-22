import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { validateCouponAction } from "../src/app/[locale]/checkout/actions";

async function main() {
  const code = "TEST10";
  await prisma.coupon.deleteMany({ where: { code } });
  const coupon = await prisma.coupon.create({
    data: {
      code,
      type: "PERCENT",
      value: 10,
      minOrder: 50000,
      usageLimit: 100,
      isActive: true,
    },
  });
  console.log("coupon created:", coupon.code, coupon.id);

  const ok = await validateCouponAction("test10", 100000);
  console.log("valid check:", ok);
  const tooLow = await validateCouponAction("TEST10", 10000);
  console.log("minOrder check:", tooLow);
  const missing = await validateCouponAction("NOPE99", 100000);
  console.log("missing check:", missing);

  const product = await prisma.product.findFirst({
    where: { isActive: true, slug: { not: "" } },
    select: { id: true, slug: true, name: true },
  });
  if (!product) throw new Error("no product");
  const demo = await prisma.user.findUnique({
    where: { email: "demo@perfumeshop.com" },
    select: { id: true },
  });
  if (!demo) throw new Error("no demo user");

  await prisma.review.deleteMany({
    where: { productId: product.id, comment: { startsWith: "SMOKE" } },
  });
  const approved = await prisma.review.create({
    data: {
      userId: demo.id,
      productId: product.id,
      rating: 5,
      title: "Smoke approved",
      comment: "SMOKE-approved review for phase 6 test",
      isApproved: true,
    },
  });
  const pending = await prisma.review.create({
    data: {
      userId: demo.id,
      productId: product.id,
      rating: 3,
      title: "Smoke pending",
      comment: "SMOKE-pending review for moderation test",
      isApproved: false,
    },
  });
  console.log("reviews:", approved.id, "(approved)", pending.id, "(pending)");
  console.log("product slug:", product.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
