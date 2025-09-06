
'use client';

import { useState, useEffect } from 'react';
import { getRecommendationsAction } from '@/actions/ai';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { getProductByName, getProducts } from '@/lib/products';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

export function Recommendations() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const history = localStorage.getItem('browsingHistory');
        const allProducts = await getProducts();
        const allProductNames = allProducts.map(p => p.name);
        
        if (history && JSON.parse(history).length > 0) {
          const result = await getRecommendationsAction({ 
            browsingHistory: JSON.parse(history).join(', '),
            allProducts: allProductNames,
          });

          if (result.recommendations && result.recommendations.length > 0) {
            const products = await Promise.all(
              result.recommendations.map(name => getProductByName(name))
            );
            setRecommendedProducts(products.filter((p): p is Product => p !== undefined));
          }
        }
      } catch (err) {
        setError('Could not fetch recommendations at this time.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const browsingHistory = localStorage.getItem('browsingHistory');
    if (browsingHistory && JSON.parse(browsingHistory).length > 0) {
      fetchRecommendations();
    }
  }, []);

  if (recommendedProducts.length === 0 && !isLoading && !error) {
    return null;
  }

  return (
    <section className="mt-16">
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center">
            <Wand2 className="mr-3 text-primary" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 font-semibold">Our AI is finding watches for you...</p>
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && !error && recommendedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {recommendedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
