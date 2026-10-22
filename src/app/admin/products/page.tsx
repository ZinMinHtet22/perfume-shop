import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatMMK } from "@/lib/format";
import { toggleProductActiveAction } from "../actions";

export const instant = false;

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  await connection();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { stock: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <Link
          href="/admin/products/new"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New product
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, slug, brand…"
          className="h-9 w-64 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2"
        />
        <button
          type="submit"
          className="h-9 rounded-md border bg-background px-3 text-sm hover:bg-muted"
        >
          Search
        </button>
      </form>

      <div className="rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Product</th>
              <th className="px-4 py-2.5 font-medium">Brand</th>
              <th className="px-4 py-2.5 font-medium">Price from</th>
              <th className="px-4 py-2.5 font-medium">Stock</th>
              <th className="px-4 py-2.5 font-medium">Active</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {p.images[0] ? (
                          <Image
                            src={p.images[0].url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">{p.brand.name}</td>
                  <td className="px-4 py-2.5">{formatMMK(p.price)}</td>
                  <td className="px-4 py-2.5">
                    <span className={totalStock <= 5 ? "font-medium text-red-600" : ""}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={toggleProductActiveAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.isActive ? "Active" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No products match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
