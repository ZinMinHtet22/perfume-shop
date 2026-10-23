import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistButton } from "@/components/wishlist-button";
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
  const cardLink = (children: React.ReactNode) =>
    product.slug ? (
      <Link href={`/product/${product.slug}`} className="block">
        {children}
      </Link>
    ) : (
      children
    );

  const imageNode = product.imageUrl ? (
    <Image
      src={product.imageUrl}
      alt={product.imageAlt ?? product.name}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  ) : null;

  return (
    <Card className="group gap-2 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a227]/30 hover:shadow-lg hover:shadow-[#c9a227]/15">
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.slug ? (
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
        )}
        <Badge className="absolute left-2 top-2" variant="secondary">
          {product.concentration}
        </Badge>
        <div className="absolute right-2 top-2">
          <WishlistButton productId={product.id} initialWished={!!product.wished} />
        </div>
      </div>
      <CardContent className="space-y-1 p-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.brandName}
        </p>
        {cardLink(
          <p className="line-clamp-1 font-medium hover:underline">
            {product.name}
          </p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">{formatMMK(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatMMK(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
