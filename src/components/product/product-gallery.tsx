"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type GalleryImage = {
  url: string;
  alt?: string | null;
};

export function ProductGallery({
  images,
  fallbackAlt,
  wishlistSlot,
}: {
  images: GalleryImage[];
  fallbackAlt: string;
  wishlistSlot?: React.ReactNode;
}) {
  const safeImages = images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const current = safeImages[active] ?? safeImages[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-[4px] border border-border bg-surface">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt ?? fallbackAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-taupe">—</div>
        )}
        {wishlistSlot ? (
          <div className="absolute right-4 top-4 z-10">{wishlistSlot}</div>
        ) : null}
      </div>

      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {safeImages.map((img, idx) => (
            <button
              key={`${img.url}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-[4px] border bg-surface transition-all duration-300",
                idx === active
                  ? "border-champagne/70 ring-1 ring-champagne/40"
                  : "border-border hover:border-ivory/25"
              )}
              aria-label={`View image ${idx + 1}`}
              aria-current={idx === active}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${fallbackAlt} ${idx + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
