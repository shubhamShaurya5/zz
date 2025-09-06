
'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number.'),
  address: z.string().min(5, 'Address is too short.'),
  city: z.string().min(2, 'City is too short.'),
  zip: z.string().min(5, 'Invalid zip code.'),
  upiReferenceId: z.string().min(5, 'Please enter a valid UPI reference ID.'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', city: '', zip: '', upiReferenceId: '' },
  });
  
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  useEffect(() => {
    // Redirect to home if cart is empty and the user is not in the process of submitting an order.
    if (!loading && !isSubmitting && items.length === 0) {
      router.push('/');
    }
  }, [items, router, loading, isSubmitting]);

  useEffect(() => {
    if (user) {
        form.setValue('name', user.displayName || '');
        form.setValue('email', user.email || '');

        // Pre-fill shipping address from localStorage
        try {
            const savedAddress = localStorage.getItem(`shippingAddress_${user.uid}`);
            if (savedAddress) {
                const { address, city, zip, phone } = JSON.parse(savedAddress);
                form.setValue('address', address);
                form.setValue('city', city);
                form.setValue('zip', zip);
                form.setValue('phone', phone);
            }
        } catch (error) {
            console.error("Failed to load shipping address from localStorage", error);
        }
    }
  }, [user, form]);


  const onSubmit = (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    console.log('Order placed:', data);

    const orderDate = new Date().toISOString();
    const orderId = new Date(orderDate).getTime();
    const userId = user?.uid; // Capture the user ID

    // Store order details in sessionStorage to be used on the success page
    try {
        const orderDetailsForSuccessPage = {
            orderId,
            items, // Full items for success page
            total,
            shippingInfo: data,
            orderDate,
        };
        sessionStorage.setItem('lastOrderDetails', JSON.stringify(orderDetailsForSuccessPage));

        // Save a leaner version of the order to localStorage for admin view to prevent quota issues
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        const sanitizedItems = items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
        }));

        const orderDetailsForAdmin = {
             orderId,
             userId, // Add userId to the stored order
             items: sanitizedItems, // Lean items for storage
             total,
             shippingInfo: data,
             orderDate,
             status: 'Placed', // Initial order status
             upiReferenceId: data.upiReferenceId,
        }
        
        allOrders.push(orderDetailsForAdmin);
        localStorage.setItem('allOrders', JSON.stringify(allOrders));

    } catch (error) {
        console.error("Failed to save order details", error);
    }

    // Save shipping address to localStorage for future use
    if (user) {
        try {
            const addressToSave = {
                address: data.address,
                city: data.city,
                zip: data.zip,
                phone: data.phone,
            };
            localStorage.setItem(`shippingAddress_${user.uid}`, JSON.stringify(addressToSave));
        } catch (error) {
            console.error("Failed to save shipping address to localStorage", error);
        }
    }

    clearCart();
    router.push('/order-success');
  };
  
  if (loading) {
    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-semibold">Loading...</p>
        </div>
    );
  }

  if (items.length === 0 && !isSubmitting) {
    return null; // Render nothing while redirecting
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle>Please Log In</CardTitle>
                <CardDescription>
                    You need to be logged in to place an order.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/login?redirect=/checkout">Login to Continue</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-headline font-bold mb-6">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-12">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="flex gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem className="flex-grow"><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} readOnly /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem className="flex-grow"><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="flex gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem className="flex-grow"><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="zip" render={({ field }) => (
                      <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        {items.map(item => (
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
                        <Separator />
                        <div className="flex justify-between font-bold text-xl">
                            <p>Total</p>
                            <p>Rs.{total.toLocaleString()}</p>
                        </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Payment Method</CardTitle>
                        <CardDescription>
                            Scan the QR code with your UPI app, then enter the transaction reference ID below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex flex-col items-center p-4 border rounded-md bg-muted/50">
                            <Image src="" alt="UPI QR Code" width={250} height={250} />
                            <p className="text-sm text-muted-foreground mt-2">Scan to pay</p>
                       </div>
                       <FormField control={form.control} name="upiReferenceId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>UPI Transaction / Reference ID</FormLabel>
                                <FormControl><Input {...field} placeholder="Enter your reference ID" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
                <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
