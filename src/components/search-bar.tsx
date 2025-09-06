
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = ["All", "Watch", "Girl watch", "Shoes", "Electronics"];

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (selectedCategory !== 'All') {
        params.set('category', selectedCategory);
      }
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full rounded-md border border-input">
      <div className="flex-shrink-0">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger 
            className="h-full rounded-r-none border-0 border-r bg-muted focus:ring-0"
            aria-label="Select category"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        type="search"
        placeholder="Search for products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-full"
      />
      <Button type="submit" className="rounded-l-none h-full" aria-label="Search">
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
}
