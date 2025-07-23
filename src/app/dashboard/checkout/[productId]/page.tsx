
'use client';

import { useEffect, useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/checkout-form';
import { useToast } from '@/hooks/use-toast';
import { createPaymentIntent } from '@/actions/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useParams } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: "Workout Plan" | "Nutrition" | "Supplements";
    imageUrl?: string;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const params = useParams();
    const productId = params.productId as string;
    const [clientSecret, setClientSecret] = useState('');
    const [product, setProduct] = useState<Product | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [loadingStripe, setLoadingStripe] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();
    

    useEffect(() => {
        const fetchProductAndCreateIntent = async () => {
            if (!productId || !user) return;
            
            setLoadingProduct(true);
            try {
                // Fetch product details from Firestore
                const productRef = doc(db, 'products', productId);
                const productSnap = await getDoc(productRef);

                if (!productSnap.exists()) {
                    toast({ title: "Error", description: "Product not found", variant: "destructive" });
                    setLoadingProduct(false);
                    return;
                }
                const productData = { id: productSnap.id, ...productSnap.data() } as Product;
                setProduct(productData);
                setLoadingProduct(false);

                // Create Payment Intent
                const res = await createPaymentIntent(productData, user.uid);
                if (res.clientSecret) {
                    setClientSecret(res.clientSecret);
                } else {
                     toast({ title: "Error", description: "Could not initialize payment.", variant: "destructive" });
                }
            } catch (error) {
                console.error("Error setting up payment:", error);
                toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
                setLoadingProduct(false);
            }
        };

        fetchProductAndCreateIntent();
    }, [productId, toast, user]);

    useEffect(() => {
        if (clientSecret) {
            setLoadingStripe(false);
        }
    }, [clientSecret]);

    const appearance = {
        theme: 'stripe',
    } as const;
      
    const options: StripeElementsOptions = {
        clientSecret,
        appearance,
    };

    if (loadingProduct) {
        return (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
             <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Product not found</CardTitle>
                        <CardDescription>This product could not be loaded. Please go back and try again.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">Secure Checkout</h1>
                <p className="text-muted-foreground">Complete your purchase for {product.name}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Card>
                        <img 
                            src={product.imageUrl || "https://placehold.co/600x400"} 
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-t-lg" 
                        />
                        <CardHeader>
                             <CardTitle>{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{product.description}</CardDescription>
                            <div className="text-2xl font-bold mt-4">Total: ${product.price.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>
                <div className="min-h-[300px] flex flex-col justify-center">
                    {loadingStripe || !clientSecret ? (
                         <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm product={product} />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    );
}
