
import { ProductCard } from '@/components/product-card';
import { Recommendations } from '@/components/recommendations';
import type { Product } from '@/lib/types';
import { getProducts } from '@/lib/products';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export const revalidate = 0; // Revalidate this page on every request

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <section className="w-full py-8 md:py-12">
        <div className="container mx-auto px-4">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                <CarouselItem>
                    <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white rounded-lg overflow-hidden">
                        <Image
                        src="https://picsum.photos/1200/800"
                        alt="Samsung Galaxy A35 5G"
                        fill
                        className="object-cover object-center"
                        data-ai-hint="underwater texture"
                        priority
                        />
                        <div className="absolute inset-0 bg-black/50" />
                        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center p-8 w-full max-w-6xl">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Image src="https://picsum.photos/400/600" alt="Galaxy A35 5G phone" width={200} height={300} className="object-contain" data-ai-hint="smartphone display" />
                                <div className='text-center'>
                                    <p className="text-2xl font-bold tracking-wider">FHD+</p>
                                    <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500" style={{fontFamily: "sans-serif"}}>Super AMOLED</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start text-left space-y-4">
                                <h2 className="text-3xl font-bold tracking-widest">SAMSUNG</h2>
                                <p className="text-xl">No. 1 selling smartphone*</p>
                                <h3 className="text-4xl font-bold">Galaxy A35 5G</h3>
                                <p className="text-3xl font-bold">From ₹19,999</p>
                                <Button size="lg">Buy Now</Button>
                            </div>
                        </div>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white rounded-lg overflow-hidden">
                        <Image
                        src="https://picsum.photos/1200/801"
                        alt="Luxury watch banner"
                        fill
                        className="object-cover object-center"
                        data-ai-hint="luxury watch"
                        />
                        <div className="absolute inset-0 bg-black/50" />
                        <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg">
                            Discover Your Timepiece
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
                            A curated collection of the world's finest watches, where elegance meets precision.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/#collection">Shop Now</Link>
                        </Button>
                        </div>
                    </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
            </Carousel>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8">
        <section id="collection" className="pt-12">
          <h2 className="text-3xl font-headline font-bold mb-6 text-center">Our Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <Recommendations />
      </div>
    </>
  );
}
