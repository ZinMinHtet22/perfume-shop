import Image from "next/image";
import { WishlistButton } from "@/components/wishlist-button";
import SpotlightCard from "@/components/react-bits/spotlight-card";
import GlareHover from "@/components/react-bits/glare-hover";
import { Link } from "@/i18n/navigation";
import { formatMMK } from "@/lib/format";

export type ProductCardData = {
  id: string;
  slug?: string;
  name: string;
  brandName: string;
  concentration: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string;
  imageAlt?: string;
  wished?: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const imageNode = product.imageUrl ? (
    <Image
      src={product.imageUrl}
      alt={product.imageAlt ?? product.name}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
    />
  ) : null;

  const imageArea = product.slug ? (
    <Link
      href={`/product/${product.slug}`}
      className="absolute inset-0"
      aria-label={product.name}
      tabIndex={-1}
      aria-hidden
    >
      {imageNode}
    </Link>
  ) : (
    imageNode
  );

  return (
    <SpotlightCard className="group flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-[4px] border border-border bg-surface transition-[border-color,box-shadow,transform] duration-500 ease-out group-hover:-translate-y-1 group-hover:border-champagne/30 group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
        <GlareHover
          borderRadius="4px"
          glareColor="#C6A664"
          glareOpacity={0.16}
          glareSize={220}
          transitionDuration={700}
          className="absolute inset-0 !border-none"
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          {imageArea}
        </GlareHover>

        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-[2px] border border-white/10 bg-canvas/70 px-2 py-1 text-[0.625rem] uppercase tracking-[0.16em] text-ivory/80 backdrop-blur-sm">
          {product.concentration}
        </span>

        <div className="absolute right-3 top-3 z-10">
          <WishlistButton
            productId={product.id}
            initialWished={!!product.wished}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-taupe">
          {product.brandName}
        </p>

        {product.slug ? (
          <Link
            href={`/product/${product.slug}`}
            className="mt-1.5 font-display text-lg leading-snug text-ivory transition-colors duration-200 hover:text-champagne"
          >
            <span className="line-clamp-1">{product.name}</span>
          </Link>
        ) : (
          <p className="mt-1.5 line-clamp-1 font-display text-lg leading-snug text-ivory">
            {product.name}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="tabular text-sm text-ivory">
            {formatMMK(product.price)}
          </span>
          {product.compareAtPrice ? (
            <span className="tabular text-xs text-taupe line-through">
              {formatMMK(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </SpotlightCard>
  );
}
