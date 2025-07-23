
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getPaymentIntent } from '@/actions/stripe';
import { doc, setDoc, serverTimestamp, collection, addDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';


function SuccessContent() {
    const searchParams = useSearchParams();
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const verifyPayment = async () => {
            if (!paymentIntentId) {
                setLoading(false);
                setStatus('error');
                return;
            }

            // Trust the redirect status first for UI, then verify with API for DB write
            setStatus(redirectStatus);

            try {
                if (redirectStatus === 'succeeded') {
                    const intent = await getPaymentIntent(paymentIntentId);

                    if (!intent || !intent.metadata?.userId || !intent.metadata?.productId) {
                         throw new Error("Payment verification failed or metadata missing.");
                    }
                    
                    const { userId, productId, productName, productDescription, productPrice, imageUrl, category } = intent.metadata;
                        
                    // --- Idempotency Check ---
                    // Check if an order or workout has already been created for this payment intent
                    const idempotencyKey = `pi_${paymentIntentId}`;
                    const orderQuery = query(collection(db, 'orders'), where('paymentIntentId', '==', idempotencyKey), limit(1));
                    const userWorkoutQuery = query(collection(db, 'user_workouts'), where('paymentIntentId', '==', idempotencyKey), limit(1));
                    
                    const [existingOrderSnap, existingWorkoutSnap] = await Promise.all([
                        getDocs(orderQuery),
                        getDocs(userWorkoutQuery)
                    ]);

                    if (!existingOrderSnap.empty || !existingWorkoutSnap.empty) {
                        console.log("Purchase already recorded for this payment. Skipping duplicate entry.");
                        setLoading(false);
                        return; // Stop execution if already processed
                    }
                    // --- End Idempotency Check ---


                    if(category === "Supplements") {
                        await addDoc(collection(db, 'orders'), {
                            userId,
                            productId,
                            productName,
                            productDescription,
                            price: parseFloat(productPrice),
                            imageUrl: imageUrl || null,
                            shipping: intent.shipping,
                            status: 'Processing',
                            purchaseDate: serverTimestamp(),
                            paymentIntentId: idempotencyKey,
                        });
                    } else {
                        const userWorkoutId = `${userId}_${productId}`;
                        const userWorkoutRef = doc(db, 'user_workouts', userWorkoutId);

                        await setDoc(userWorkoutRef, {
                            userId: userId,
                            productId: productId,
                            purchaseDate: serverTimestamp(),
                            status: 'active',
                            paymentIntentId: idempotencyKey,
                        }, { merge: true });
                    }
                }
            } catch (error) {
                console.error("Error during payment verification or db write:", error);
                toast({ title: "Error", description: "An error occurred while confirming your purchase.", variant: "destructive" });
                setStatus('error');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [paymentIntentId, redirectStatus, toast]);

    if (loading) {
        return (
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Verifying payment status...</p>
            </div>
        );
    }
    
    if (status === 'succeeded') {
        return (
            <>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <CardTitle>Payment Successful!</CardTitle>
                <CardDescription>
                    Thank you for your purchase. Your items will be available in your dashboard shortly.
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
    
    if (status === 'processing') {
         return (
            <>
                <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
                <CardTitle>Payment Processing</CardTitle>
                <CardDescription>
                    Your payment is processing. We'll update you shortly. Please check your dashboard later.
                </CardDescription>
                 <div className="mt-6 flex gap-4">
                     <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
                </div>
            </>
        );
    }

    return (
        <>
            <AlertCircle className="h-12 w-12 text-red-500" />
            <CardTitle>Payment Failed or Canceled</CardTitle>
            <CardDescription>
                We couldn't process your payment. Please try again or contact support if the problem persists.
            </CardDescription>
             <div className="mt-6 flex gap-4">
                <Button asChild>
                    <Link href="/dashboard/marketplace">Try Again</Link>
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
