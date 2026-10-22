"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function submitReviewAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const productId = String(formData.get("productId") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 2000);

  if (!productId || !(rating >= 1 && rating <= 5) || !comment) return;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return;

  const userId = session.user.id;
  const existing = await prisma.review.findFirst({
    where: { userId, productId },
    select: { id: true },
  });

  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: { rating, title: title || null, comment, isApproved: false },
    });
  } else {
    await prisma.review.create({
      data: { userId, productId, rating, title: title || null, comment },
    });
  }

  revalidatePath(`/${locale}/product`, "page");
}
