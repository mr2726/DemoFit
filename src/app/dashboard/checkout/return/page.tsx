'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Stripe from 'stripe';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    apiVersion: '2024-06-20',
    typescript: true,
});

export default function ReturnPage() {
    const [status, setStatus] = useState<Stripe.Checkout.Session.Status | null>(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            router.push('/dashboard/marketplace');
            return;
        }

        stripe.checkout.sessions.retrieve(sessionId)
            .then((session) => {
                setStatus(session.status);
                setCustomerEmail(session.customer_details?.email || '');
            })
            .catch((error) => {
                console.error("Error retrieving session:", error);
                setStatus('expired');
            });

    }, [searchParams, router]);

    const ReturnContent = () => {
        if (status === 'open') {
            return (
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                    <CardTitle>Processing your payment...</CardTitle>
                    <CardDescription>Please wait while we confirm your transaction.</CardDescription>
                </div>
            );
        }

        if (status === 'complete') {
            return (
                 <div className="flex flex-col items-center justify-center text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle>Payment Successful!</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        Thank you for your purchase. A confirmation email has been sent to {customerEmail}. You can now access your new items in your dashboard.
                    </CardDescription>
                    <div className="flex gap-4 mt-6">
                        <Button asChild>
                           <Link href="/dashboard/my-workouts">Go to My Workouts</Link>
                        </Button>
                         <Button asChild variant="outline">
                           <Link href="/dashboard/marketplace">Keep Shopping</Link>
                        </Button>
                    </div>
                </div>
            );
        }

        if(status === 'expired') {
             return (
                 <div className="flex flex-col items-center justify-center text-center">
                    <XCircle className="h-16 w-16 text-destructive mb-4" />
                    <CardTitle>Payment Failed or Expired</CardTitle>
                    <CardDescription className="max-w-md mx-auto">
                        Unfortunately, we could not process your payment. Your session may have expired or been cancelled. Please try again.
                    </CardDescription>
                     <Button asChild className="mt-6">
                        <Link href="/dashboard/marketplace">Return to Marketplace</Link>
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                <CardTitle>Loading...</CardTitle>
            </div>
        );
    }


    return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
            <Card className="w-full max-w-lg">
                <CardContent className="p-10">
                   <ReturnContent />
                </CardContent>
            </Card>
        </div>
    );
}
