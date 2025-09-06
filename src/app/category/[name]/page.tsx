
import { getProductsByCategory } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { notFound } from 'next/navigation';
import type { Product } from '@/lib/types';

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { name: string } }) {
  const categoryName = decodeURIComponent(params.name).replace(/-/g, ' ');
  const products = await getProductsByCategory(categoryName);

  // Since getProductsByCategory now returns an empty array for non-existent categories,
  // you might decide if you still need a notFound() call based on your app's logic.
  // For instance, if certain category slugs should always exist.
  // if (products.length === 0) {
  //   notFound();
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold mb-6 capitalize">{categoryName}</h1>
      {products.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No products found in this category.</h2>
          <p className="text-muted-foreground">Check back later or explore our other collections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
