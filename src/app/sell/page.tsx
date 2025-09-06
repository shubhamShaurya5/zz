
'use client';

import { UploadForm } from '@/components/upload-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, Trash2, ShieldAlert } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getProducts, removeProduct } from '@/lib/products';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

// Hardcoded list of admin emails.
// In a real-world application, this should be managed through a database or Firebase custom claims.
const ADMIN_EMAILS = ['shubhamshauryabgp@gmail.com', 'superadmin@luxury.com'];

function ListedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const allProducts = await getProducts();
    // In a real app, you might want to filter to show only products listed by the current admin.
    // For now, we show all products.
    setProducts(allProducts);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRemove = async (productId: string) => {
    try {
      await removeProduct(productId);
      toast({
          title: "Product Removed",
          description: "The product has been successfully removed.",
      });
      // Refresh the list
      loadProducts();
      router.refresh();
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to remove the product.",
            variant: "destructive",
        });
    }
  };

  if (loading) {
      return (
          <div className="mt-12 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p>Loading your products...</p>
          </div>
      )
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-headline font-bold mb-6">Your Listed Watches</h2>
      {products.length > 0 ? (
        <div className="space-y-4">
            {products.map(product => (
                <Card key={product.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Image src={product.imageUrl} alt={product.name} width={80} height={80} className="rounded-md" data-ai-hint={product.dataAiHint} />
                            <div>
                                <h3 className="font-semibold">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.brand}</p>
                                <p className="text-sm font-bold text-primary">Rs.{product.price.toLocaleString()}</p>
                            </div>
                        </div>
                        <Button variant="destructive" size="icon" onClick={() => handleRemove(product.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You haven't listed any watches yet.</p>
      )}
    </div>
  );
}


export default function SellPage() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-semibold">Loading...</p>
        </div>
    );
  }
  
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Authentication Required</CardTitle>
                    <CardDescription>
                        You must be logged in to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login?redirect=/sell">Login</Link>
                    </Button>
                </CardContent>
            </Card>
      </div>
    );
  }

  if (!isAdmin) {
      return (
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
            <Card className="w-full max-w-md text-center border-destructive">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                        <ShieldAlert className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="mt-4">Access Denied</CardTitle>
                    <CardDescription>
                        You do not have permission to view this page. This area is restricted to administrators only.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center gap-2">
                    <Button asChild>
                        <Link href="/">Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold">Sell Your Timepiece</h1>
        <p className="text-muted-foreground mt-2">
          List your watch on Luxury Emporium. Fill out the details below.
        </p>
      </div>
      <UploadForm />
      <ListedProducts />
    </div>
  );
}
