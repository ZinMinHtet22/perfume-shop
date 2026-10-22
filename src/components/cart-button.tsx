"use client";

import { useSyncExternalStore } from "react";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useCartStore, cartCount } from "@/store/cart";

const emptySubscribe = () => () => {};

export function CartButton() {
  const items = useCartStore((state) => state.items);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const count = mounted ? cartCount(items) : 0;

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart" aria-label="Cart">
        <ShoppingBag className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
