"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sourceForMethod, verifyReceipt } from "@/lib/ai/verify-receipt";
import type { OrderStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("unauthorized");
  }
  return session.user.id;
}

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
  revalidatePath("/shop");
  revalidatePath("/en/shop");
  revalidatePath("/my/shop");
}

export type ActionState = { error: string | null; ok?: boolean };

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["AWAITING_PAYMENT", "CONFIRMED", "CANCELLED"],
  AWAITING_PAYMENT: ["PAID", "CONFIRMED", "CANCELLED"],
  PAID: ["CONFIRMED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin().catch(() => redirect("/login"));

  const orderId = String(formData.get("orderId") ?? "");
  const next = String(formData.get("next") ?? "") as OrderStatus;
  const backTo = String(formData.get("backTo") ?? "/admin/orders");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });
  if (!order || !TRANSITIONS[order.status]?.includes(next)) {
    redirect(`${backTo}?err=invalidTransition`);
  }

  await prisma.$transaction(async (tx) => {
    if (next === "CANCELLED") {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.qty } },
        });
      }
      if (order.payment && order.payment.status !== "PAID") {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: "CANCELLED" },
        });
        await tx.paymentEvent.create({
          data: {
            paymentId: order.payment.id,
            type: "MANUAL",
            payload: { action: "cancel", by: "admin", orderId },
          },
        });
      }
    }

    if (next === "DELIVERED" && order.paymentMethod === "COD" && order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      await tx.paymentEvent.create({
        data: {
          paymentId: order.payment.id,
          type: "MANUAL",
          payload: { action: "cod-delivered", orderId },
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: next,
        cancelReason: next === "CANCELLED" ? "Cancelled by admin" : undefined,
      },
    });
  });

  revalidateAdmin();
  redirect(`${backTo}?ok=status`);
}

export async function reviewPaymentAction(formData: FormData): Promise<void> {
  const adminId = await requireAdmin().catch(() => redirect("/login"));

  const paymentId = String(formData.get("paymentId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const backTo = String(formData.get("backTo") ?? "/admin/receipts");
  const note = String(formData.get("adminNote") ?? "").slice(0, 500);

  if (decision !== "APPROVE" && decision !== "REJECT") {
    redirect(`${backTo}?err=invalidDecision`);
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
  if (!payment || payment.status !== "AWAITING_REVIEW") {
    redirect(`${backTo}?err=notAwaitingReview`);
  }

  await prisma.$transaction(async (tx) => {
    if (decision === "APPROVE") {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "PAID", paidAt: new Date(), adminNote: note || null },
      });
      if (payment.order.status === "AWAITING_PAYMENT") {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        });
      }
      await tx.paymentVerification.updateMany({
        where: { paymentId, reviewStatus: "PENDING" },
        data: { reviewStatus: "APPROVED", reviewedById: adminId, reviewedAt: new Date() },
      });
    } else {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "PENDING", adminNote: note || null },
      });
      await tx.paymentVerification.updateMany({
        where: { paymentId, reviewStatus: "PENDING" },
        data: { reviewStatus: "REJECTED", reviewedById: adminId, reviewedAt: new Date() },
      });
    }
    await tx.paymentEvent.create({
      data: {
        paymentId,
        type: "MANUAL",
        payload: { action: decision.toLowerCase(), note, by: adminId },
      },
    });
  });

  revalidateAdmin();
  redirect(`${backTo}?ok=reviewed`);
}

export async function runAiCheckAction(formData: FormData): Promise<void> {
  await requireAdmin().catch(() => redirect("/login"));

  const paymentId = String(formData.get("paymentId") ?? "");
  const backTo = String(formData.get("backTo") ?? "/admin/receipts");

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
  if (!payment?.receiptImageUrl) {
    redirect(`${backTo}?err=noReceipt`);
  }

  const result = await verifyReceipt({
    receiptImageUrl: payment.receiptImageUrl,
    expectedAmount: payment.amount,
    orderNo: payment.order.orderNo,
    method: payment.provider,
  });

  await prisma.$transaction([
    prisma.paymentVerification.create({
      data: {
        paymentId,
        imageUrl: payment.receiptImageUrl,
        source: sourceForMethod(payment.provider),
        rulesVerdict: result.rulesVerdict,
        ocrText: result.ocrText,
        aiProvider: result.aiProvider,
        aiVerdict: result.aiVerdict,
        confidence: result.confidence,
        extracted: result.extracted,
        reasons: result.reasons,
        reviewStatus: "PENDING",
      },
    }),
    prisma.paymentEvent.create({
      data: {
        paymentId,
        type: "AI_CHECK",
        payload: {
          rulesVerdict: result.rulesVerdict,
          aiVerdict: result.aiVerdict,
          confidence: result.confidence,
        },
      },
    }),
  ]);

  revalidateAdmin();
  redirect(`${backTo}?ok=aicheck`);
}

const variantSchema = z.object({
  id: z.string().optional(),
  sizeMl: z.coerce.number().int().min(1).max(500),
  price: z.coerce.number().int().min(0).max(100_000_000),
  stock: z.coerce.number().int().min(0).max(1_000_000),
});

const productSchema = z.object({
  name: z.string().min(1).max(150),
  nameMy: z.string().max(150).optional().or(z.literal("")),
  description: z.string().min(1).max(5000),
  descriptionMy: z.string().max(5000).optional().or(z.literal("")),
  slug: z
    .string()
    .min(1)
    .max(150)
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  concentration: z.enum(["EDT", "EDP", "PARFUM", "COLOGNE"]),
  scentFamily: z.string().max(100).optional().or(z.literal("")),
  compareAtPrice: z.coerce.number().int().min(0).optional().or(z.literal("")),
  isActive: z.coerce.boolean(),
  variantsJson: z.string().min(2),
  imagesText: z.string().max(10000).optional().or(z.literal("")),
  noteIdsJson: z.string().optional().or(z.literal("[]")),
});

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export type ProductActionResult = { error: string | null; id?: string };

async function saveProduct(
  productId: string | null,
  adminId: string,
  formData: FormData
): Promise<ProductActionResult> {
  void adminId;
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    nameMy: formData.get("nameMy") ?? "",
    description: formData.get("description"),
    descriptionMy: formData.get("descriptionMy") ?? "",
    slug: formData.get("slug") || slugify(String(formData.get("name") ?? "")),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    gender: formData.get("gender"),
    concentration: formData.get("concentration"),
    scentFamily: formData.get("scentFamily") ?? "",
    compareAtPrice: formData.get("compareAtPrice") ?? "",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    variantsJson: formData.get("variantsJson") ?? "[]",
    imagesText: formData.get("imagesText") ?? "",
    noteIdsJson: formData.get("noteIdsJson") ?? "[]",
  });
  if (!parsed.success) return { error: "invalidInput" };

  let variants: z.infer<typeof variantSchema>[];
  try {
    const arr = JSON.parse(parsed.data.variantsJson);
    const v = z.array(variantSchema).min(1).max(10).safeParse(arr);
    if (!v.success) return { error: "invalidVariants" };
    variants = v.data;
  } catch {
    return { error: "invalidVariants" };
  }

  let noteIds: string[] = [];
  try {
    const arr = JSON.parse(parsed.data.noteIdsJson ?? "[]");
    if (Array.isArray(arr)) noteIds = arr.map(String).slice(0, 50);
  } catch {
    noteIds = [];
  }

  const images = String(parsed.data.imagesText ?? "")
    .split("\n")
    .map((u) => u.trim())
    .filter((u) => u.length > 0 && u.length < 2000)
    .slice(0, 12);

  const basePrice = Math.min(...variants.map((v) => v.price));
  const d = parsed.data;

  const slugTaken = await prisma.product.findFirst({
    where: { slug: d.slug, NOT: { id: productId ?? undefined } },
  });
  if (slugTaken) return { error: "slugTaken" };

  const product = await prisma.$transaction(async (tx) => {
    const base = productId
      ? await tx.product.update({
          where: { id: productId },
          data: {
            name: d.name,
            slug: d.slug,
            brandId: d.brandId,
            categoryId: d.categoryId,
            gender: d.gender,
            concentration: d.concentration,
            description: d.description,
            scentFamily: d.scentFamily || null,
            price: basePrice,
            compareAtPrice: d.compareAtPrice || null,
            isActive: d.isActive,
          },
        })
      : await tx.product.create({
          data: {
            name: d.name,
            slug: d.slug,
            brandId: d.brandId,
            categoryId: d.categoryId,
            gender: d.gender,
            concentration: d.concentration,
            description: d.description,
            scentFamily: d.scentFamily || null,
            price: basePrice,
            compareAtPrice: d.compareAtPrice || null,
            isActive: d.isActive,
          },
        });

    const en = await tx.productTranslation.upsert({
      where: { productId_locale: { productId: base.id, locale: "en" } },
      create: { productId: base.id, locale: "en", name: d.name, description: d.description },
      update: { name: d.name, description: d.description },
    });
    void en;
    if (d.nameMy && d.descriptionMy) {
      await tx.productTranslation.upsert({
        where: { productId_locale: { productId: base.id, locale: "my" } },
        create: {
          productId: base.id,
          locale: "my",
          name: d.nameMy,
          description: d.descriptionMy,
        },
        update: { name: d.nameMy, description: d.descriptionMy },
      });
    }

    const existing = await tx.productVariant.findMany({ where: { productId: base.id } });
    const keepIds = new Set(variants.map((v) => v.id).filter(Boolean) as string[]);
    for (const ev of existing) {
      if (!keepIds.has(ev.id)) {
        const inUse = await tx.orderItem.count({ where: { variantId: ev.id } });
        if (inUse === 0) {
          const inCart = await tx.cartItem.count({ where: { variantId: ev.id } });
          if (inCart === 0) {
            await tx.productVariant.delete({ where: { id: ev.id } });
          } else {
            await tx.productVariant.update({
              where: { id: ev.id },
              data: { stock: 0 },
            });
          }
        } else {
          await tx.productVariant.update({
            where: { id: ev.id },
            data: { stock: 0 },
          });
        }
      }
    }
    for (const [i, v] of variants.entries()) {
      const data = { sizeMl: v.sizeMl, price: v.price, stock: v.stock };
      if (v.id && existing.some((e) => e.id === v.id)) {
        await tx.productVariant.update({ where: { id: v.id }, data });
      } else {
        await tx.productVariant.create({
          data: {
            ...data,
            productId: base.id,
            sku: `${d.slug}-${v.sizeMl}ml-${i}-${base.id.slice(-6)}`,
          },
        });
      }
    }

    await tx.productImage.deleteMany({ where: { productId: base.id } });
    if (images.length > 0) {
      await tx.productImage.createMany({
        data: images.map((url, i) => ({ productId: base.id, url, sortOrder: i })),
      });
    }

    await tx.productNote.deleteMany({ where: { productId: base.id } });
    if (noteIds.length > 0) {
      const validNotes = await tx.note.findMany({ where: { id: { in: noteIds } } });
      await tx.productNote.createMany({
        data: validNotes.map((n) => ({ productId: base.id, noteId: n.id })),
      });
    }

    return base;
  });

  revalidateAdmin();
  return { error: null, id: product.id };
}

export async function createProductAction(
  _prevState: ProductActionResult,
  formData: FormData
): Promise<ProductActionResult> {
  let adminId: string;
  try {
    adminId = await requireAdmin();
  } catch {
    return { error: "unauthorized" };
  }
  return saveProduct(null, adminId, formData);
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductActionResult,
  formData: FormData
): Promise<ProductActionResult> {
  let adminId: string;
  try {
    adminId = await requireAdmin();
  } catch {
    return { error: "unauthorized" };
  }
  return saveProduct(productId, adminId, formData);
}

export async function toggleProductActiveAction(productId: string): Promise<void> {
  await requireAdmin().catch(() => redirect("/login"));
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) redirect("/admin/products?err=notFound");
  await prisma.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });
  revalidateAdmin();
  redirect("/admin/products?ok=toggled");
}

export async function createCouponAction(formData: FormData): Promise<void> {
  await requireAdmin().catch(() => redirect("/login"));

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "");
  const value = Number(formData.get("value"));
  const minOrder = Number(formData.get("minOrder") || 0);
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();
  const usageLimit = usageLimitRaw === "" ? null : Number(usageLimitRaw);
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  if (!code || !/^[A-Z0-9_-]{3,40}$/.test(code)) {
    redirect("/admin/coupons?err=invalidCode");
  }
  if (type !== "PERCENT" && type !== "FIXED") {
    redirect("/admin/coupons?err=invalidType");
  }
  if (!Number.isInteger(value) || value <= 0) {
    redirect("/admin/coupons?err=invalidValue");
  }
  if (type === "PERCENT" && value > 100) {
    redirect("/admin/coupons?err=invalidValue");
  }
  if (!Number.isInteger(minOrder) || minOrder < 0) {
    redirect("/admin/coupons?err=invalidMinOrder");
  }
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) {
    redirect("/admin/coupons?err=invalidUsageLimit");
  }
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    redirect("/admin/coupons?err=invalidExpiry");
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) redirect("/admin/coupons?err=codeExists");

  await prisma.coupon.create({
    data: {
      code,
      type,
      value,
      minOrder,
      usageLimit,
      expiresAt,
      isActive: true,
    },
  });

  revalidateAdmin();
  redirect("/admin/coupons?ok=created");
}

export async function toggleCouponActiveAction(couponId: string): Promise<void> {
  await requireAdmin().catch(() => redirect("/login"));
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) redirect("/admin/coupons?err=notFound");
  await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive: !coupon.isActive },
  });
  revalidateAdmin();
  redirect("/admin/coupons?ok=toggled");
}

export async function approveReviewAction(formData: FormData): Promise<void> {
  await requireAdmin().catch(() => redirect("/login"));
  const reviewId = String(formData.get("reviewId") ?? "");
  const backTo = String(formData.get("backTo") ?? "/admin/reviews");

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) redirect(`${backTo}?err=notFound`);

  await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: true },
  });

  revalidateAdmin();
  redirect(`${backTo}?ok=approved`);
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  await requireAdmin().catch(() => redirect("/login"));
  const reviewId = String(formData.get("reviewId") ?? "");
  const backTo = String(formData.get("backTo") ?? "/admin/reviews");

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) redirect(`${backTo}?err=notFound`);

  await prisma.review.delete({ where: { id: reviewId } });

  revalidateAdmin();
  redirect(`${backTo}?ok=deleted`);
}

const changePasswordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(1).max(100),
  confirm: z.string().min(1),
});

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const userId = await requireAdmin().catch(() => redirect("/login"));

  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: "Please fill in all fields." };
  }

  const { current, next, confirm } = parsed.data;

  if (next !== confirm) {
    return { error: "Passwords do not match." };
  }
  if (next.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (!/[a-zA-Z]/.test(next) || !/\d/.test(next)) {
    return {
      error: "New password must include at least one letter and one number.",
    };
  }
  if (next === current) {
    return {
      error: "New password must be different from your current password.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { error: "Account not found." };
  }

  const valid = await compare(current, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hash(next, 10) },
  });

  return { error: null, ok: true };
}
