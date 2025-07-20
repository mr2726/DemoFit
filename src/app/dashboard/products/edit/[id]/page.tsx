'use client';
import { ProductForm } from '@/components/product-form';
import { useRouter } from 'next/navigation';
import React from 'react';

const mockProductData = {
    name: "Advanced Gym Routine",
    description: "A 12-week program for experienced gym-goers looking to break plateaus.",
    price: 49.00,
    category: "Workout Plan" as const,
    imageUrl: "https://placehold.co/600x400",
    weeks: 12,
    exercises: [
        { name: 'Bench Press', videoOrDescription: 'Lie on a flat bench...', sets: 4, reps: '8-12', rest: 90 },
        { name: 'Deadlift', videoOrDescription: 'Stand with your mid-foot...', sets: 3, reps: '5', rest: 120 },
    ],
    recipes: [],
    stock: undefined,
    totalKcal: undefined,
};


export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;

    const handleFormSubmit = () => {
        // Here you would typically handle form submission, e.g., send data to an API
        // After successful submission, redirect the user.
        console.log(`Product with id ${id} updated.`);
        router.push('/dashboard/products');
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Edit Product</h1>
                <p className="text-muted-foreground">Update the details for product ID: {id}</p>
            </header>
            <ProductForm 
                onSubmit={handleFormSubmit} 
                initialData={mockProductData}
                submitButtonText="Update Product"
            />
        </div>
    );
}
