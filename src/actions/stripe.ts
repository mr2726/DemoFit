
'use server';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductFormValues } from '@/components/product-form';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export async function createCheckoutSession(productId: string): Promise<{ clientSecret: string | null; error?: string }> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return { clientSecret: null, error: 'Product not found.' };
    }

    const product = productSnap.data() as ProductFormValues;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              images: product.imageUrl ? [product.imageUrl] : [],
            },
            unit_amount: Math.round(product.price * 100), // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${baseUrl}/dashboard/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
       automatic_tax: { enabled: true },
    });

    return { clientSecret: session.client_secret };
  } catch (e) {
    console.error('Stripe Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { clientSecret: null, error: `Could not create checkout session: ${errorMessage}` };
  }
}

export async function getCheckoutSessionStatus(sessionId: string): Promise<{ status: Stripe.Checkout.Session.Status | null, customerEmail: string | null, error?: string }> {
    if (!sessionId) {
        return { status: null, customerEmail: null, error: 'Session ID is required.' };
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return {
            status: session.status,
            customerEmail: session.customer_details?.email || null,
        };
    } catch (e) {
        console.error("Error retrieving session:", e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { status: 'expired', customerEmail: null, error: `Could not retrieve session: ${errorMessage}` };
    }
}
