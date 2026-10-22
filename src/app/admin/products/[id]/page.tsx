import { notFound } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormInitial } from "../product-form";

export const instant = false;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  await connection();
  const { id } = await params;

  const [product, brands, categories, notes] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { sizeMl: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        translations: true,
        productNotes: { select: { noteId: true } },
      },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.note.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }], select: { id: true, name: true, type: true } }),
  ]);

  if (!product) notFound();

  const my = product.translations.find((t) => t.locale === "my");

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brandId: product.brandId,
    categoryId: product.categoryId,
    gender: product.gender,
    concentration: product.concentration,
    description: product.description,
    scentFamily: product.scentFamily ?? "",
    compareAtPrice: product.compareAtPrice,
    isActive: product.isActive,
    nameMy: my?.name ?? "",
    descriptionMy: my?.description ?? "",
    variants: product.variants.map((v) => ({
      id: v.id,
      sizeMl: v.sizeMl,
      price: v.price,
      stock: v.stock,
    })),
    imagesText: product.images.map((i) => i.url).join("\n"),
    noteIds: product.productNotes.map((pn) => pn.noteId),
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit: {product.name}</h1>
      <ProductForm brands={brands} categories={categories} notes={notes} initial={initial} />
    </div>
  );
}
