
'use client';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, FormEvent } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
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
            <PaymentElement />
            <Button disabled={isLoading || !stripe || !elements} className="w-full" size="lg">
                {isLoading ? <Loader2 className="animate-spin" /> : `Pay Now`}
            </Button>
        </form>
    );
}
