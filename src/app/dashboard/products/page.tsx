'use client';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Product {
    id: string;
    name: string;
    category: "Workout Plan" | "Nutrition" | "Supplements";
    price: number;
    stock?: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

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
                description: "Failed to fetch products.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await deleteDoc(doc(db, "products", productId));
            setProducts(products.filter(p => p.id !== productId));
            toast({
                title: "Success",
                description: "Product deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting product:", error);
            toast({
                title: "Error",
                description: "Failed to delete product.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Products</h1>
                    <p className="text-muted-foreground">Manage your marketplace products.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Product List</CardTitle>
                    <CardDescription>View and manage all products available in the marketplace.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                        <TableCell>{product.stock ?? 'N/A'}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/products/edit/${product.id}`}>Edit</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(product.id)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
