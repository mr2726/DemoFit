
'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { createCheckoutSession } from '@/actions/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ProductFormValues } from '@/components/product-form';
import Image from 'next/image';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage({ params }: { params: { productId: string } }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const productId = params.productId;

  useEffect(() => {
    const fetchProductAndCreateSession = async () => {
      if (!productId) {
        setLoading(false);
        toast({ title: 'Error', description: 'Product ID is missing.', variant: 'destructive' });
        return;
      }
      setLoading(true);
      try {
        // Fetch product details
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          toast({ title: 'Error', description: 'Product not found.', variant: 'destructive' });
          setLoading(false);
          return;
        }

        const productData = docSnap.data() as ProductFormValues;
        setProduct(productData);

        // Create Stripe checkout session
        const { clientSecret, error } = await createCheckoutSession(productId);
        if (error) {
          toast({ title: 'Error', description: error, variant: 'destructive' });
          setLoading(false);
          return;
        }

        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error in checkout page:', err);
        toast({ title: 'Error', description: 'Could not initialize checkout. Please try again.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndCreateSession();
  }, [productId, toast]);

  if (loading || !product) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Preparing your secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>You are about to purchase the following item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative h-60 w-full">
                    <Image
                        src={product.imageUrl || "https://placehold.co/600x400"}
                        alt={product.name}
                        fill={true}
                        style={{objectFit: 'cover'}}
                        className="rounded-lg"
                        data-ai-hint="fitness product"
                    />
                </div>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{product.name}</h2>
                    <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                </div>
                <p className="text-muted-foreground">{product.description}</p>
            </CardContent>
        </Card>
      </div>
      <div>
        {clientSecret ? (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout className="w-full"/>
          </EmbeddedCheckoutProvider>
        ) : (
           <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted/50">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading payment form...</p>
            </div>
        )}
      </div>
    </div>
  );
}
