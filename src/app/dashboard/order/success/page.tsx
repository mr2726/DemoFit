'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCheckoutSession } from '@/actions/stripe';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [sessionStatus, setSessionStatus] = useState<string | null>(null);
    const [customerEmail, setCustomerEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            getCheckoutSession(sessionId)
                .then((session) => {
                    if (session) {
                        setSessionStatus(session.status);
                        setCustomerEmail(session.customer_email);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [sessionId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Verifying payment status...</p>
            </div>
        );
    }
    
    if (sessionStatus === 'complete') {
        return (
            <>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <CardTitle>Payment Successful!</CardTitle>
                <CardDescription>
                    Thank you for your purchase. A confirmation email has been sent to {customerEmail}.
                </CardDescription>
                <div className="mt-6 flex gap-4">
                    <Button asChild>
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/marketplace">Continue Shopping</Link>
                    </Button>
                </div>
            </>
        );
    }
    
    if (sessionStatus === 'open') {
         return (
            <>
                <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
                <CardTitle>Payment Processing</CardTitle>
                <CardDescription>
                    Your payment is still processing. We'll update you shortly. Please wait a moment and refresh the page.
                </CardDescription>
                 <div className="mt-6 flex gap-4">
                     <Button onClick={() => window.location.reload()}>Refresh</Button>
                </div>
            </>
        );
    }

    return (
        <>
            <AlertCircle className="h-12 w-12 text-red-500" />
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
                We couldn't verify your payment. If you have been charged, please contact support.
            </CardDescription>
             <div className="mt-6 flex gap-4">
                <Button asChild>
                    <Link href="/dashboard/marketplace">Back to Marketplace</Link>
                </Button>
            </div>
        </>
    );
}


export default function OrderSuccessPage() {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-4 py-8">
                     <Suspense fallback={<Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />}>
                        <SuccessContent />
                    </Suspense>
                </CardHeader>
            </Card>
        </div>
    );
}
