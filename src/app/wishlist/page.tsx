'use client';

import { useWishlist } from '@/hooks/use-wishlist';
import { ProductCard } from '@/components/product-card';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold mb-6">Your Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty.</h2>
          <p className="text-muted-foreground mb-4">
            Add items you love to your wishlist to see them here.
          </p>
          <Button asChild>
            <Link href="/">Explore Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
