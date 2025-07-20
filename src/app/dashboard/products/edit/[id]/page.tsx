'use client';
import { ProductForm, ProductFormValues } from '@/components/product-form';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function EditProductPage({ params: { id } }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [initialData, setInitialData] = useState<ProductFormValues | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!id) return;
        
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setInitialData(docSnap.data() as ProductFormValues);
                } else {
                    toast({
                        title: "Error",
                        description: "Product not found.",
                        variant: "destructive"
                    });
                    router.push('/dashboard/products');
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                 toast({
                    title: "Error",
                    description: "Failed to fetch product details.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, router, toast]);

    const handleFormSubmit = async (data: ProductFormValues) => {
        try {
            const docRef = doc(db, "products", id);
            await updateDoc(docRef, data);
            toast({
                title: "Success",
                description: "Product updated successfully."
            });
            router.push('/dashboard/products');
        } catch (e) {
            console.error("Error updating document: ", e);
            toast({
                title: "Error",
                description: "Failed to update product.",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!initialData) {
        return null; // or a not found component
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Edit Product</h1>
                <p className="text-muted-foreground">Update the details for product ID: {id}</p>
            </header>
            <ProductForm 
                onSubmit={handleFormSubmit} 
                initialData={initialData}
                submitButtonText="Update Product"
            />
        </div>
    );
}
