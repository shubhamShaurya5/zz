
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addProduct } from '@/lib/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRouter } from 'next/navigation';

const uploadSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  brand: z.string().min(2, 'Brand must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(1, 'Price must be at least 1.'),
  category: z.string({ required_error: 'Please select a category.' }),
  image: z.any().refine((files) => files?.length === 1, 'Image is required.'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;
const categories = ["Watch", "Girl watch", "Shoes", "Electronics"];

export function UploadForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      price: 0,
      image: undefined,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: UploadFormValues) => {
    setIsSubmitting(true);
    if (!imagePreview) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'An image is required to list a product.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
        const newProduct = {
          name: data.name,
          brand: data.brand,
          description: data.description,
          price: data.price,
          category: data.category,
          imageUrl: imagePreview,
          dataAiHint: `${data.brand.toLowerCase()} ${data.name.toLowerCase().split(' ').slice(0,1).join(' ')}` // Basic hint
        };

        await addProduct(newProduct);
        
        toast({ title: 'Product Submitted!', description: 'Your watch has been listed for sale.' });
        form.reset();
        setImagePreview(null);
        const imageInput = document.getElementById('image-input') as HTMLInputElement | null;
        if (imageInput) {
            imageInput.value = '';
        }
        // Manually trigger a refresh of the server-side props for the page
        router.refresh();
    } catch(error) {
        console.error("Failed to add product", error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error listing your product.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="brand" render={({ field }) => (
                <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Price (Rs.)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input id="image-input" type="file" accept="image/*" onChange={(e) => {
                    onChange(e.target.files);
                    handleImageChange(e);
                  }} {...rest} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {imagePreview && (
              <div>
                <FormLabel>Image Preview</FormLabel>
                <Image src={imagePreview} alt="Image preview" width={300} height={300} className="rounded-md mt-2" />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || !imagePreview}>
                {isSubmitting ? 'Listing Product...' : 'List Product for Sale'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
