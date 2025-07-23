
'use client';
import { PaymentElement, useStripe, useElements, AddressElement } from '@stripe/react-stripe-js';
import { useState, FormEvent, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: "Workout Plan" | "Nutrition" | "Supplements";
    imageUrl?: string;
}

export default function CheckoutForm({ product }: { product: Product }) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isStripeReady, setIsStripeReady] = useState(false);

    useEffect(() => {
        if (stripe && elements) {
            setIsStripeReady(true);
        }
    }, [stripe, elements]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/order/success`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
             toast({
                title: "Payment failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } else {
             toast({
                title: "An unexpected error occurred",
                description: "Please try again.",
                variant: "destructive",
            });
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {product.category === 'Supplements' && (
                <div className='space-y-4'>
                    <h3 className="text-lg font-medium">Shipping Address</h3>
                    <AddressElement options={{mode: 'shipping'}} />
                    <Separator />
                </div>
            )}
            <h3 className="text-lg font-medium">Payment Details</h3>
            <PaymentElement />
            <Button disabled={isLoading || !isStripeReady} className="w-full" size="lg">
                {isLoading ? <Loader2 className="animate-spin" /> : `Pay Now`}
            </Button>
        </form>
    );
}
