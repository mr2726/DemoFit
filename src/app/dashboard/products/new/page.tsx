'use client';
import { ProductForm } from '@/components/product-form';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
    const router = useRouter();

    const handleFormSubmit = () => {
        // Here you would typically handle form submission, e.g., send data to an API
        // After successful submission, redirect the user.
        router.push('/dashboard/products');
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Add New Product</h1>
                <p className="text-muted-foreground">Fill in the details below to create a new product.</p>
            </header>
            <ProductForm onSubmit={handleFormSubmit} />
        </div>
    );
}
