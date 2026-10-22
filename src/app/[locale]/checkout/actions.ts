"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CheckoutResult = { error: string | null };

export type CouponCheckResult = {
  valid: boolean;
  code: string | null;
  discount: number;
  error: string | null;
};

export async function validateCouponAction(
  codeInput: string,
  subtotal: number
): Promise<CouponCheckResult> {
  const code = codeInput.trim().toUpperCase();
  if (!code) {
    return { valid: false, code: null, discount: 0, error: "emptyCode" };
  }
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) {
    return { valid: false, code: null, discount: 0, error: "invalidCoupon" };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { valid: false, code: null, discount: 0, error: "couponExpired" };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, code: null, discount: 0, error: "couponUsedUp" };
  }
  if (subtotal < coupon.minOrder) {
    return { valid: false, code: null, discount: 0, error: "couponMinOrder" };
  }
  const discount =
    coupon.type === "PERCENT"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  return {
    valid: true,
    code: coupon.code,
    discount: Math.min(Math.max(discount, 0), subtotal),
    error: null,
  };
}

class CheckoutError extends Error {}

const linesSchema = z.array(
  z.object({
    variantId: z.string().min(1),
    qty: z.number().int().min(1).max(99),
  })
).min(1).max(50);

const addressSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(6).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional().or(z.literal("")),
  zip: z.string().max(20).optional().or(z.literal("")),
});

async function generateOrderNo(): Promise<string> {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const prefix = `PF-${ymd}-`;
  const count = await prisma.order.count({
    where: { orderNo: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

function isRedirectError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e as { digest: unknown }).digest === "string" &&
    (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function createCheckoutAction(
  _prevState: CheckoutResult,
  formData: FormData
): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "loginRequired" };
  }
  const userId = session.user.id;

  const locale =
    typeof formData.get("locale") === "string" &&
    ["en", "my"].includes(formData.get("locale") as string)
      ? (formData.get("locale") as string)
      : "en";

  const method = formData.get("method");
  if (method !== "KBZPAY" && method !== "BANK" && method !== "COD") {
    return { error: "invalidInput" };
  }

  let linesJson: unknown;
  try {
    linesJson = JSON.parse(String(formData.get("lines") ?? "[]"));
  } catch {
    return { error: "invalidInput" };
  }
  const parsedLines = linesSchema.safeParse(linesJson);
  if (!parsedLines.success) return { error: "invalidInput" };

  const parsedAddress = addressSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") ?? "",
    city: formData.get("city"),
    state: formData.get("state") ?? "",
    zip: formData.get("zip") ?? "",
  });
  if (!parsedAddress.success) return { error: "invalidInput" };

  const variantIds = [...new Set(parsedLines.data.map((l) => l.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  if (variants.length !== variantIds.length) {
    return { error: "variantNotFound" };
  }
  const variantById = new Map(variants.map((v) => [v.id, v]));

  const subtotal = parsedLines.data.reduce(
    (sum, l) => sum + (variantById.get(l.variantId)?.price ?? 0) * l.qty,
    0
  );

  const shippingSetting = await prisma.siteSetting.findUnique({
    where: { key: "shipping" },
  });
  const shipCfg = (shippingSetting?.value ?? {}) as {
    feeMmk?: number;
    freeOverMmk?: number;
  };
  const fee = shipCfg.feeMmk ?? 3000;
  const freeOver = shipCfg.freeOverMmk ?? 150000;
  const shipping = subtotal >= freeOver ? 0 : fee;

  const couponCodeRaw =
    typeof formData.get("couponCode") === "string"
      ? (formData.get("couponCode") as string).trim().toUpperCase()
      : "";
  let discount = 0;
  let couponId: string | null = null;
  if (couponCodeRaw) {
    const check = await validateCouponAction(couponCodeRaw, subtotal);
    if (!check.valid) return { error: check.error ?? "invalidCoupon" };
    discount = check.discount;
    const coupon = await prisma.coupon.findUnique({
      where: { code: check.code! },
      select: { id: true },
    });
    couponId = coupon?.id ?? null;
  }
  const total = Math.max(subtotal + shipping - discount, 0);

  const note = typeof formData.get("note") === "string" ? (formData.get("note") as string).slice(0, 500) : null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNo = await generateOrderNo();
    try {
      const order = await prisma.$transaction(async (tx) => {
        for (const line of parsedLines.data) {
          const updated = await tx.productVariant.updateMany({
            where: { id: line.variantId, stock: { gte: line.qty } },
            data: { stock: { decrement: line.qty } },
          });
          if (updated.count === 0) throw new CheckoutError("outOfStock");
        }

        const created = await tx.order.create({
          data: {
            orderNo,
            userId,
            status: method === "COD" ? "CONFIRMED" : "AWAITING_PAYMENT",
            paymentMethod: method,
            subtotal,
            tax: 0,
            shipping,
            discount,
            total,
            couponId,
            addressSnapshot: { ...parsedAddress.data, country: "MM" },
            note: note || null,
            items: {
              create: parsedLines.data.map((l) => {
                const v = variantById.get(l.variantId)!;
                return {
                  variantId: v.id,
                  productName: v.product.name,
                  sizeMl: v.sizeMl,
                  priceAtPurchase: v.price,
                  qty: l.qty,
                };
              }),
            },
          },
        });

        if (couponId) {
          const couponRow = await tx.coupon.findUnique({
            where: { id: couponId },
          });
          if (!couponRow || !couponRow.isActive) {
            throw new CheckoutError("invalidCoupon");
          }
          if (
            couponRow.expiresAt &&
            couponRow.expiresAt.getTime() < Date.now()
          ) {
            throw new CheckoutError("couponExpired");
          }
          if (
            couponRow.usageLimit != null &&
            couponRow.usedCount >= couponRow.usageLimit
          ) {
            throw new CheckoutError("couponUsedUp");
          }
          await tx.coupon.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } },
          });
        }

        await tx.payment.create({
          data: {
            orderId: created.id,
            provider: method,
            status: method === "COD" ? "CREATED" : "PENDING",
            amount: total,
            currency: "MMK",
            merchOrderId: orderNo,
          },
        });

        return created;
      });

      redirect(`/${locale}/pay/${order.orderNo}`);
    } catch (e) {
      if (e instanceof CheckoutError) {
        return { error: e.message };
      }
      if (isRedirectError(e)) throw e;
    }
  }

  return { error: "orderFailed" };
}
