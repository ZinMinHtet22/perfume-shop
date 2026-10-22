"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createProductAction,
  updateProductAction,
  type ProductActionResult,
} from "../actions";

export type VariantRow = {
  id?: string;
  sizeMl: number;
  price: number;
  stock: number;
};

export type ProductFormInitial = {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  gender: string;
  concentration: string;
  description: string;
  scentFamily: string;
  compareAtPrice: number | null;
  isActive: boolean;
  nameMy: string;
  descriptionMy: string;
  variants: VariantRow[];
  imagesText: string;
  noteIds: string[];
};

type Option = { id: string; name: string; extra?: string };

const EMPTY_VARIANT: VariantRow = { sizeMl: 50, price: 0, stock: 0 };

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function ProductForm({
  brands,
  categories,
  notes,
  initial,
}: {
  brands: Option[];
  categories: Option[];
  notes: (Option & { type: string })[];
  initial: ProductFormInitial | null;
}) {
  const router = useRouter();
  const action = initial ? updateProductAction.bind(null, initial.id) : createProductAction;
  const [state, formAction, pending] = useActionState<
    ProductActionResult,
    FormData
  >(async (prev, formData) => {
    const result = await (action as (p: ProductActionResult, f: FormData) => Promise<ProductActionResult>)(
      prev,
      formData
    );
    if (!result.error && result.id) {
      router.push(`/admin/products/${result.id}`);
    }
    return result;
  }, { error: null });

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.length ? initial.variants : [{ ...EMPTY_VARIANT }]
  );
  const [imagesText, setImagesText] = useState(initial?.imagesText ?? "");
  const [noteIds, setNoteIds] = useState<Set<string>>(new Set(initial?.noteIds ?? []));

  const notesByType = useMemo(() => {
    const map: Record<string, (Option & { type: string })[]> = {};
    for (const n of notes) {
      (map[n.type] ??= []).push(n);
    }
    return map;
  }, [notes]);

  const variantsJson = JSON.stringify(variants);
  const noteIdsJson = JSON.stringify([...noteIds]);

  const updateVariant = (i: number, patch: Partial<VariantRow>) => {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  };

  const errorText = state.error
    ? {
        unauthorized: "You must be an admin.",
        invalidInput: "Please check the form inputs.",
        invalidVariants: "Add at least one valid variant (size, price, stock).",
        slugTaken: "That slug is already used by another product.",
      }[state.error] ?? state.error
    : null;

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-medium">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name (EN)</Label>
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandId">Brand</Label>
            <Select id="brandId" name="brandId" required defaultValue={initial?.brandId}>
              <option value="" disabled>
                Select brand…
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={initial?.categoryId}
            >
              <option value="" disabled>
                Select category…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select id="gender" name="gender" required defaultValue={initial?.gender ?? "UNISEX"}>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="UNISEX">Unisex</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="concentration">Concentration</Label>
            <Select
              id="concentration"
              name="concentration"
              required
              defaultValue={initial?.concentration ?? "EDT"}
            >
              <option value="EDT">EDT</option>
              <option value="EDP">EDP</option>
              <option value="PARFUM">Parfum</option>
              <option value="COLOGNE">Cologne</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scentFamily">Scent family (optional)</Label>
            <Input
              id="scentFamily"
              name="scentFamily"
              defaultValue={initial?.scentFamily ?? ""}
              placeholder="e.g. Floral Woody"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Compare-at price MMK (optional)</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              min={0}
              defaultValue={initial?.compareAtPrice ?? ""}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (EN)</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={5}
            defaultValue={initial?.description ?? ""}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="isActive" defaultChecked={initial?.isActive ?? true} />
          Active (visible in store)
        </label>
      </section>

      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-medium">Burmese translation (optional)</h2>
        <div className="space-y-2">
          <Label htmlFor="nameMy">Name (MY)</Label>
          <Input id="nameMy" name="nameMy" defaultValue={initial?.nameMy ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descriptionMy">Description (MY)</Label>
          <Textarea
            id="descriptionMy"
            name="descriptionMy"
            rows={4}
            defaultValue={initial?.descriptionMy ?? ""}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-background p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Variants</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVariants((vs) => [...vs, { ...EMPTY_VARIANT }])}
          >
            Add variant
          </Button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-md border p-3">
              <div className="w-24 space-y-1">
                <Label className="text-xs">Size (ml)</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={v.sizeMl}
                  onChange={(e) => updateVariant(i, { sizeMl: Number(e.target.value) })}
                />
              </div>
              <div className="w-36 space-y-1">
                <Label className="text-xs">Price (MMK)</Label>
                <Input
                  type="number"
                  min={0}
                  value={v.price}
                  onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                />
              </div>
              {variants.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <input type="hidden" name="variantsJson" value={variantsJson} />
      </section>

      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-medium">Images</h2>
        <p className="text-sm text-muted-foreground">
          One URL per line (first image is the cover). Example: https://picsum.photos/seed/xyz/800
        </p>
        <Textarea
          name="imagesText"
          rows={4}
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          placeholder="https://…"
        />
      </section>

      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-medium">Fragrance notes</h2>
        {(["TOP", "HEART", "BASE"] as const).map((type) => (
          <div key={type}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {type}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {(notesByType[type] ?? []).map((n) => (
                <label key={n.id} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={noteIds.has(n.id)}
                    onChange={(e) => {
                      setNoteIds((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(n.id);
                        else next.delete(n.id);
                        return next;
                      });
                    }}
                  />
                  {n.name}
                </label>
              ))}
              {(notesByType[type] ?? []).length === 0 ? (
                <span className="text-sm text-muted-foreground">None defined.</span>
              ) : null}
            </div>
          </div>
        ))}
        <input type="hidden" name="noteIdsJson" value={noteIdsJson} />
      </section>

      {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
