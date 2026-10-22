import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";

export const instant = false;

export const metadata = { title: "New product — Admin" };

export default async function NewProductPage() {
  await connection();

  const [brands, categories, notes] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.note.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }], select: { id: true, name: true, type: true } }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
      <ProductForm brands={brands} categories={categories} notes={notes} initial={null} />
    </div>
  );
}
