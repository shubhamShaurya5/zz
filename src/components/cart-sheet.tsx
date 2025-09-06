
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CartSheet() {
  const { items, removeFromCart, updateQuantity, clearCart, isSheetOpen, setIsSheetOpen } = useCart();
  const router = useRouter();

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    setIsSheetOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">Shopping Cart</SheetTitle>
        </SheetHeader>
        <Separator />
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Looks like you haven't added anything yet.</p>
            <Button onClick={() => setIsSheetOpen(false)}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow pr-4">
              <div className="flex flex-col gap-4 my-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden">
                       <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        data-ai-hint={item.product.dataAiHint}
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Rs.{item.product.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value, 10))}
                          className="w-16 h-8"
                        />
                         <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}>
                           <Trash2 className="h-4 w-4 text-muted-foreground" />
                         </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto">
                <div className="w-full space-y-4">
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>Rs.{total.toLocaleString()}</span>
                    </div>
                    <Button className="w-full" onClick={handleCheckout}>
                        Proceed to Checkout
                    </Button>
                    <Button variant="outline" className="w-full" onClick={clearCart}>
                        Clear Cart
                    </Button>
                </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
