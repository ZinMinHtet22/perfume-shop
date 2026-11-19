"use client";

import { useEffect, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useRecentStore } from "@/store/recent";
import { formatMMK } from "@/lib/format";
import Magnet from "@/components/react-bits/magnet";

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
  const addRecent = useRecentStore((state) => state.addRecent);

  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstInStock?.id);
  const [qty, setQtyState] = useState(1);
  const [added, setAdded] = useState(false);

  // Remember the perfume being viewed so the home page can recommend similar ones.
  useEffect(() => {
    addRecent(product.productId);
  }, [product.productId, addRecent]);

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
    <div className="space-y-5">
      <div>
        <p className="eyebrow mb-3 text-taupe">{t("sizeLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock <= 0}
              onClick={() => setSelectedId(v.id)}
              className={`rounded-[4px] border px-4 py-2 text-sm transition-colors duration-200 ${
                v.id === selectedId
                  ? "border-champagne bg-champagne text-canvas"
                  : "border-border text-ash hover:border-ivory/25 hover:text-ivory"
              } ${v.stock <= 0 ? "opacity-40" : ""}`}
            >
              {v.sizeMl} ml
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="flex items-baseline gap-3 border-t border-border pt-5">
          <span className="tabular font-display text-3xl text-ivory">
            {formatMMK(selected.price)}
          </span>
          <span className="text-xs text-ash">
            {selected.stock > 0
              ? t("inStock", { count: selected.stock })
              : t("soldOut")}
          </span>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-[4px] border border-border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-none rounded-l-[3px]"
            onClick={() => setQtyState((q) => Math.max(1, q - 1))}
            aria-label="decrease"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="tabular w-10 text-center text-sm">{qty}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-none rounded-r-[3px]"
            onClick={() => setQtyState((q) => Math.min(99, q + 1))}
            aria-label="increase"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Magnet magnetStrength={20}>
          <Button
            size="lg"
            className="h-11 flex-1 rounded-[4px] text-[0.8125rem] tracking-[0.02em] hover:bg-brass"
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
        </Magnet>
      </div>
    </div>
  );
}
