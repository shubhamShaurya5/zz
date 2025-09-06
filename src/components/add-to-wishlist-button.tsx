'use client';

import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import type { Product } from '@/lib/types';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToWishlistButtonProps {
  product: Product;
}

export function AddToWishlistButton({ product }: AddToWishlistButtonProps) {
  const { addToWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        addToWishlist(product);
      }}
      className="bg-card/70 hover:bg-card"
    >
      <Heart className={cn('h-5 w-5 text-muted-foreground', {
        'text-primary fill-primary': inWishlist
      })} />
    </Button>
  );
}
