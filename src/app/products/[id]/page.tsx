
import { getProductById } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { AddToWishlistButton } from '@/components/add-to-wishlist-button';
import { Separator } from '@/components/ui/separator';
import ProductView from './product-view';

export const revalidate = 0;

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <ProductView product={product}>
        <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.dataAiHint}
            />
            </div>
            <div>
            <p className="text-sm font-medium text-primary mb-2">{product.brand}</p>
            <h1 className="text-4xl lg:text-5xl font-headline font-bold mb-4">{product.name}</h1>
            <p className="text-3xl text-primary font-bold mb-6">Rs.{product.price.toLocaleString()}</p>
            <p className="text-muted-foreground mb-6 text-lg">{product.description}</p>
            <Separator className="my-6" />
            <div className="flex items-center gap-4">
                <div className="flex-grow">
                    <AddToCartButton product={product} />
                </div>
                <AddToWishlistButton product={product} />
            </div>
            </div>
        </div>
        </div>
    </ProductView>
  );
}
