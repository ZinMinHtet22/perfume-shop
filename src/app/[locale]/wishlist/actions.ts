"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type WishlistResult = { error: string | null; added: boolean };

export async function toggleWishlistAction(
  productId: string,
  locale: string
): Promise<WishlistResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "loginRequired", added: false };
  }
  const userId = session.user.id;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return { error: "notFound", added: false };

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    revalidatePath(`/${locale}/wishlist`);
    revalidatePath(`/${locale}/product`, "page");
    return { error: null, added: false };
  }

  await prisma.wishlistItem.create({ data: { userId, productId } });
  revalidatePath(`/${locale}/wishlist`);
  revalidatePath(`/${locale}/product`, "page");
  return { error: null, added: true };
}
