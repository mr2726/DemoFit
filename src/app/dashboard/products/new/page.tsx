'use client';
import { ProductForm } from '@/components/product-form';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { ProductFormValues } from '@/components/product-form';


export default function NewProductPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleFormSubmit = async (data: ProductFormValues) => {
        try {
            await addDoc(collection(db, "products"), data);
            toast({
                title: "Success",
                description: "Product created successfully."
            });
            router.push('/dashboard/products');
        } catch (e) {
            console.error("Error adding document: ", e);
            toast({
                title: "Error",
                description: "Failed to create product.",
                variant: "destructive"
            });
        }
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
