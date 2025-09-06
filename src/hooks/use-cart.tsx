
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from './use-toast';
import { getProductById } from '@/lib/products';
import { useAuth } from './use-auth';

export type CartItem = {
  product: Product;
  quantity: number;
};

// This is what we'll store in localStorage, now keyed by user ID
type StoredCart = {
    [userId: string]: StoredCartItem[];
}

type StoredCartItem = {
  productId: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [storedItems, setStoredItems] = useState<StoredCartItem[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.uid || 'anonymous';

  // Load cart from localStorage for the current user
  useEffect(() => {
    try {
      const allCartsJSON = localStorage.getItem('carts');
      if (allCartsJSON) {
        const allCarts = JSON.parse(allCartsJSON) as StoredCart;
        setStoredItems(allCarts[userId] || []);
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, [userId]);

  // Save cart to localStorage whenever it changes for the current user
  useEffect(() => {
    try {
        const allCartsJSON = localStorage.getItem('carts');
        const allCarts = allCartsJSON ? JSON.parse(allCartsJSON) as StoredCart : {};
        if (storedItems.length > 0) {
            allCarts[userId] = storedItems;
        } else {
            delete allCarts[userId]; // Clean up if cart is empty
        }
        localStorage.setItem('carts', JSON.stringify(allCarts));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [storedItems, userId]);

  const [items, setItems] = useState<CartItem[]>([]);

  const hydrateItems = useCallback(async () => {
    const hydrated: CartItem[] = [];
    for (const item of storedItems) {
        const product = await getProductById(item.productId);
        if (product) {
            hydrated.push({ product, quantity: item.quantity });
        }
    }
    setItems(hydrated);
  }, [storedItems]);

  useEffect(() => {
    hydrateItems();
  }, [hydrateItems]);


  const addToCart = (product: Product, quantity = 1) => {
    setStoredItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { productId: product.id, quantity }];
    });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
    setIsSheetOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setStoredItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setStoredItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setStoredItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isSheetOpen, setIsSheetOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
