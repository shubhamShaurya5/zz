
'use client';

import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';

const ADMIN_EMAILS = ['shubhamshauryabgp@gmail.com', 'superadmin@luxury.com'];

export function Footer() {
  const { user } = useAuth();
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
          &copy; {new Date().getFullYear()} Luxury Emporium. All rights reserved.
        </p>
        <div className="flex items-center space-x-6 text-sm">
            <Link href="/sell" className="text-muted-foreground hover:text-primary transition-colors">Sell a Watch</Link>
            {isAdmin && (
               <Link href="/admin/orders" className="text-muted-foreground hover:text-primary transition-colors">Admin Orders</Link>
            )}
        </div>
      </div>
    </footer>
  );
}
