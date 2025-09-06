
'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Menu, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { CartSheet } from '@/components/cart-sheet';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from './ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { CategoryNav } from './category-nav';
import { SearchBar } from './search-bar';
import { ThemeToggle } from './theme-toggle';


export function Header() {
  const { items: cartItems, setIsSheetOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  const navLinks = (
    <>
    </>
  );

  return (
    <>
      <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="container mx-auto px-4 flex justify-between items-center h-20">
          <Link href="/" className="text-2xl font-headline font-bold text-primary">
            Luxury Emporium
          </Link>

          <div className="hidden md:flex flex-grow max-w-xl mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
             <Link href="/wishlist" aria-label="Wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5 text-muted-foreground" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsSheetOpen(true)}
              aria-label="Open shopping cart"
            >
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Button>
            
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/my-orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <div className="hidden md:flex items-center gap-2">
                    <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                        Login
                    </Link>
                    <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                        Sign Up
                    </Link>
                </div>
            )}

            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col space-y-4 p-4">
                    <Link href="/" className="text-lg font-headline font-bold text-primary mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                      Luxury Emporium
                    </Link>
                    <div className="px-4">
                      <SearchBar />
                    </div>
                    {navLinks}
                     {user && (
                        <Button variant="outline" onClick={() => { router.push('/my-orders'); setIsMobileMenuOpen(false); }}>My Orders</Button>
                    )}
                    <div className="pt-4 mt-auto">
                        <div className="flex flex-col space-y-2">
                        {user ? (
                            <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</Button>
                        ) : (
                            <>
                                <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}><Link href="/login">Login</Link></Button>
                                <Button asChild onClick={() => setIsMobileMenuOpen(false)}><Link href="/signup">Sign Up</Link></Button>
                            </>
                        )}
                        </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        <CategoryNav />
      </header>
      <CartSheet />
    </>
  );
}
