
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Apple, Package, Star, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: "Workout Plan" | "Nutrition" | "Supplements";
    imageUrl?: string;
    weeks?: number;
    totalKcal?: number;
    stock?: number;
}

const MarketplaceCard = ({ item }: { item: Product }) => {
    const getTag = () => {
        switch (item.category) {
            case "Workout Plan":
                return item.weeks ? `${item.weeks} Weeks` : 'Workout';
            case "Nutrition":
                return item.totalKcal ? `${item.totalKcal} kcal` : 'Nutrition';
            case "Supplements":
                return item.stock !== undefined ? `${item.stock} in stock` : 'Supplement';
            default:
                return 'New';
        }
    };

    return (
        <Card className="flex flex-col">
            <img 
                src={item.imageUrl || "https://placehold.co/600x400"}
                alt={item.name}
                className="w-full h-48 object-cover rounded-t-lg"
                data-ai-hint="fitness product"
            />
            <CardHeader>
                 <h3 className="font-semibold text-lg">{item.name}</h3>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0">
                <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto">
                <span className="text-2xl font-bold">${item.price.toFixed(2)}</span>
                <Button asChild>
                    <Link href={`/dashboard/checkout/${item.id}`}>Buy Now</Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

const ProductList = ({ products }: { products: Product[] }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
        {products.map(item => <MarketplaceCard key={item.id} item={item} />)}
    </div>
);

export default function MarketplacePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch marketplace products.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [toast]);

    const workoutPlans = products.filter(p => p.category === 'Workout Plan');
    const nutritionPlans = products.filter(p => p.category === 'Nutrition');
    const supplements = products.filter(p => p.category === 'Supplements');

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Marketplace</h1>
                <p className="text-muted-foreground">Discover plans, guides, and supplements to supercharge your fitness.</p>
            </header>
            <Tabs defaultValue="plans" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="plans"><Dumbbell className="mr-2 h-4 w-4" />Workout Plans</TabsTrigger>
                    <TabsTrigger value="nutrition"><Apple className="mr-2 h-4 w-4" />Nutrition</TabsTrigger>
                    <TabsTrigger value="supplements"><Package className="mr-2 h-4 w-4" />Supplements</TabsTrigger>
                </TabsList>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="plans">
                            <ProductList products={workoutPlans} />
                        </TabsContent>
                        <TabsContent value="nutrition">
                            <ProductList products={nutritionPlans} />
                        </TabsContent>
                        <TabsContent value="supplements">
                            <ProductList products={supplements} />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
