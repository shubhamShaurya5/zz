'use client';

import { useEffect } from 'react';
import type { Product } from '@/lib/types';

interface ProductViewProps {
  product: Product;
  children: React.ReactNode;
}

export default function ProductView({ product, children }: ProductViewProps) {
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('browsingHistory') || '[]');
      if (!history.includes(product.name)) {
        const newHistory = [product.name, ...history].slice(0, 10); // Keep last 10 items
        localStorage.setItem('browsingHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error('Could not update browsing history:', error);
    }
  }, [product.name]);

  return <>{children}</>;
}
