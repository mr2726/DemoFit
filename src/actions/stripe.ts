'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
}

export async function createCheckoutSession(product: Product) {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
    }
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description,
                        images: product.imageUrl ? [product.imageUrl] : [],
                    },
                    unit_amount: Math.round(product.price * 100), // price in cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/order/cancel`,
        automatic_tax: { enabled: true },
    });

    if (session.url) {
        redirect(session.url);
    } else {
        throw new Error('Could not create Stripe checkout session');
    }
}

export async function getCheckoutSession(sessionId: string) {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return {
            status: session.status,
            customer_email: session.customer_details?.email,
        };
    } catch (error) {
        console.error("Error retrieving session:", error);
        return null;
    }
}
