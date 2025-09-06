
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const categories = ["Home", "Watch", "Girl watch", "Shoes", "Electronics"];

export function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-6 h-12 overflow-x-auto">
          {categories.map((category) => {
            const href = category === 'Home'
              ? '/'
              : `/category/${category.toLowerCase().replace(' ', '-')}`;
            
            const isActive = category === 'Home' ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={category}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary whitespace-nowrap',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {category}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
