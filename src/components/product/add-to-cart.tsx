"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { formatMMK } from "@/lib/format";

export type VariantOption = {
  id: string;
  sizeMl: number;
  price: number;
  stock: number;
};

type AddToCartProduct = {
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  imageUrl?: string;
};

export function AddToCart({
  product,
  variants,
}: {
  product: AddToCartProduct;
  variants: VariantOption[];
}) {
  const t = useTranslations("Product");
  const addItem = useCartStore((state) => state.addItem);

  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstInStock?.id);
  const [qty, setQtyState] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const soldOut = !selected || selected.stock <= 0;

  const handleAdd = () => {
    if (!selected) return;
    addItem(
      {
        id: selected.id,
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        brandName: product.brandName,
        sizeMl: selected.sizeMl,
        price: selected.price,
        imageUrl: product.imageUrl,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">{t("sizeLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock <= 0}
              onClick={() => setSelectedId(v.id)}
              className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                v.id === selectedId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } ${v.stock <= 0 ? "opacity-40" : ""}`}
            >
              {v.sizeMl} ml
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold">
            {formatMMK(selected.price)}
          </span>
          <span className="text-sm text-muted-foreground">
            {selected.stock > 0
              ? t("inStock", { count: selected.stock })
              : t("soldOut")}
          </span>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setQtyState((q) => Math.max(1, q - 1))}
            aria-label="decrease"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setQtyState((q) => Math.min(99, q + 1))}
            aria-label="increase"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          size="lg"
          className="flex-1"
          disabled={soldOut}
          onClick={handleAdd}
        >
          {added ? (
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" /> {t("added")}
            </span>
          ) : (
            t("addToCart")
          )}
        </Button>
      </div>
    </div>
  );
}
