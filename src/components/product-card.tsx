import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { AddToWishlistButton } from './add-to-wishlist-button';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square w-full overflow-hidden relative">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        </Link>
        <div className="absolute top-2 right-2 z-10">
          <AddToWishlistButton product={product} />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground font-medium mb-1">{product.brand}</p>
        <Link href={`/products/${product.id}`}>
            <CardTitle className="font-headline text-lg leading-tight hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">
          Rs.{product.price.toLocaleString()}
        </p>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}
