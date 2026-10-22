"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  sizeMl: number;
  price: number;
  qty: number;
  imageUrl?: string;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, qty: Math.min(i.qty + qty, 99) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty }] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          items: state.items.flatMap((i) =>
            i.id === id ? (qty <= 0 ? [] : [{ ...i, qty }]) : [i]
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "ps_cart_v1" }
  )
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.qty, 0);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.qty * i.price, 0);
