
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsEmailSent(true);
    } catch (error: any) {
      console.error("Password reset error:", error);
      // For security reasons (to prevent email enumeration), we show a generic success message
      // even if the email doesn't exist or another error occurs.
      // The real error is logged to the console for debugging purposes.
      if (error.code !== 'auth/user-not-found') {
        // We can still inform the user about other types of errors, like an invalid email format.
        let description = `Failed to send email. Please try again later.`;
        if (error.code === 'auth/invalid-email') {
            description = 'The email address is not valid.';
        }
        toast({
            variant: 'destructive',
            title: 'Error',
            description,
        });
      }
      // We set this to true to show the confirmation page regardless, which is a security best practice.
      setIsEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
      return (
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Check Your Email</CardTitle>
                    <CardDescription>
                        If an account exists for the email you entered, a password reset link has been sent.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button asChild>
                        <Link href="/login">Return to Login</Link>
                    </Button>
                     <Button asChild variant="secondary">
                        <Link href="/">Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          </Form>
            <div className="mt-6 text-center text-sm">
                <Link href="/login" className="underline hover:text-primary">
                    Back to Login
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
