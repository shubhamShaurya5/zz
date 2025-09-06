
import { ProductCard } from '@/components/product-card';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { SearchX } from 'lucide-react';
import { Suspense } from 'react';

async function SearchResults({ query, category }: { query: string; category?: string | null }) {
    let products = await getProducts();

    if (category && category !== 'All') {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (query) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    return (
        <>
        <h1 className="text-4xl font-headline font-bold mb-6">
            Search Results {query && `for "${query}"`}
            {category && category !== 'All' && <span className="text-2xl text-muted-foreground"> in {category}</span>}
        </h1>
        {products.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <SearchX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No products found.</h2>
                <p className="text-muted-foreground">Try adjusting your search terms or category.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        )}
        </>
    );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    category?: string;
  };
}) {
    const query = searchParams?.q || '';
    const category = searchParams?.category;

    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<div>Loading search results...</div>}>
                <SearchResults query={query} category={category} />
            </Suspense>
        </div>
    );
}
