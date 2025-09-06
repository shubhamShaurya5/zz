
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@/lib/types';
import { getProductById } from '@/lib/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PackageOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type ShippingInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
};

type StoredOrderItem = {
  productId: string;
  quantity: number;
};

type StoredOrder = {
  orderId: number;
  userId?: string;
  items: StoredOrderItem[];
  total: number;
  shippingInfo: ShippingInfo;
  orderDate: string;
  status: string;
  upiReferenceId?: string;
};

type HydratedOrderItem = {
    product: Product;
    quantity: number;
};

type HydratedOrder = Omit<StoredOrder, 'items'> & {
  items: HydratedOrderItem[];
};

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Placed': return 'default';
        case 'Shipped': return 'secondary';
        case 'Out for Delivery': return 'outline';
        case 'Delivered': return 'destructive';
        case 'Cancelled': return 'destructive';
        default: return 'default';
    }
};

export default function MyOrdersPage() {
  const { user, loading } = useAuth();
  const [userOrders, setUserOrders] = useState<HydratedOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setDataLoading(true);
        const storedOrdersJSON = localStorage.getItem('allOrders');
        if (storedOrdersJSON) {
          const allOrders = JSON.parse(storedOrdersJSON) as StoredOrder[];
          const currentUserOrders = allOrders.filter(order => order.userId === user.uid);

          const hydratedOrders = await Promise.all(
            currentUserOrders.map(async (order) => {
              const hydratedItems = await Promise.all(
                order.items.map(async (item) => {
                  const product = await getProductById(item.productId);
                  return product ? { product, quantity: item.quantity } : null;
                })
              );
              return { ...order, items: hydratedItems.filter((i): i is HydratedOrderItem => i !== null) };
            })
          );

          const sortedOrders = hydratedOrders.sort((a, b) => b.orderId - a.orderId);
          setUserOrders(sortedOrders);
        }
        setDataLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-semibold">Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
            <CardDescription>You need to be logged in to view your orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login?redirect=/my-orders">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (dataLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-semibold">Fetching order details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold mb-6">My Orders</h1>
      {userOrders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">You haven't placed any orders yet.</h2>
          <p className="text-muted-foreground mb-4">When you place an order, it will appear here.</p>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {userOrders.map(order => (
            <AccordionItem value={String(order.orderId)} key={order.orderId} className="border rounded-lg">
               <Card>
                <AccordionTrigger className="p-6 hover:no-underline">
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <p className="text-lg font-semibold">Order #{order.orderId}</p>
                            <p className="text-sm text-muted-foreground">Placed on: {new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                           <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                           <p className="font-bold text-lg mt-1">Rs.{order.total.toLocaleString()}</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-4 text-lg">Order Details</h4>
                            <div className="space-y-4">
                            {order.items.map(item => (
                                <div key={item.product.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="rounded-md" data-ai-hint={item.product.dataAiHint} />
                                    <div>
                                    <p className="font-semibold">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">Rs.{(item.product.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2">Shipping To:</h4>
                                <address className="not-italic text-muted-foreground">
                                    {order.shippingInfo.name}<br />
                                    {order.shippingInfo.address}<br />
                                    {order.shippingInfo.city}, {order.shippingInfo.zip}<br/>
                                    {order.shippingInfo.phone}
                                </address>
                            </div>
                            {order.upiReferenceId && (
                                <div>
                                    <h4 className="font-semibold mb-2">Payment Details</h4>
                                    <p className="text-sm text-muted-foreground">UPI Reference ID:</p>
                                    <p className="font-mono text-sm">{order.upiReferenceId}</p>
                                </div>
                            )}
                        </div>
                    </div>
                  </CardContent>
                </AccordionContent>
               </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
