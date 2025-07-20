
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Stripe } from 'stripe';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCheckoutSessionStatus } from '@/actions/stripe';
import { useToast } from '@/hooks/use-toast';

function ReturnContent() {
    const [status, setStatus] = useState<Stripe.Checkout.Session.Status | null>(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            router.push('/dashboard/marketplace');
            return;
        }

        getCheckoutSessionStatus(sessionId)
            .then(({ status, customerEmail, error }) => {
                if (error) {
                    toast({ title: "Error", description: error, variant: "destructive" });
                    setStatus('expired');
                } else {
                    setStatus(status);
                    setCustomerEmail(customerEmail || '');
                }
            })
            .catch((err) => {
                console.error("Error fetching session status:", err);
                toast({ title: "Error", description: "Failed to verify payment status.", variant: "destructive" });
                setStatus('expired');
            })
            .finally(() => {
                setLoading(false);
            });

    }, [searchParams, router, toast]);

    if (loading) {
         return (
            <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Verifying your payment...</h2>
                <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
            </div>
        );
    }

    if (status === 'open') {
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Processing your payment...</h2>
                <p className="text-muted-foreground">This may take a moment. Please don't close this page.</p>
            </div>
        );
    }

    if (status === 'complete') {
        return (
             <div className="flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold">Payment Successful!</h2>
                <p className="max-w-md mx-auto text-muted-foreground mt-2">
                    Thank you for your purchase. A confirmation email has been sent to {customerEmail}. You can now access your new items in your dashboard.
                </p>
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

    // This includes 'expired' or any other non-complete status
    return (
         <div className="flex flex-col items-center justify-center text-center">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Payment Failed or Expired</h2>
            <p className="max-w-md mx-auto text-muted-foreground mt-2">
                Unfortunately, we could not process your payment. Your session may have expired or been cancelled. Please try again.
            </p>
             <Button asChild className="mt-6">
                <Link href="/dashboard/marketplace">Return to Marketplace</Link>
            </Button>
        </div>
    );
}

export default function ReturnPage() {
    return (
        <Suspense fallback={
             <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
                <Card className="w-full max-w-lg">
                    <CardContent className="p-10">
                       <ReturnContent />
                    </CardContent>
                </Card>
            </div>
        </Suspense>
    );
}
