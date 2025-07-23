
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
    category: "Workout Plan" | "Nutrition" | "Supplements";
    imageUrl?: string;
}

export async function createPaymentIntent(product: Product, userId: string) {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(product.price * 100), // price in cents
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true,
        },
        description: `Purchase of ${product.name}`,
        metadata: {
            userId: userId,
            productId: product.id,
            productName: product.name,
            productDescription: product.description,
            productPrice: product.price.toString(),
            category: product.category,
            imageUrl: product.imageUrl || '',
        }
    });

    return {
        clientSecret: paymentIntent.client_secret,
    };
}

export async function getPaymentIntent(paymentIntentId: string) {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set in the environment variables.');
    }
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return {
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            metadata: paymentIntent.metadata,
            shipping: paymentIntent.shipping,
        };
    } catch (error) {
        console.error("Error retrieving payment intent:", error);
        return null;
    }
}
