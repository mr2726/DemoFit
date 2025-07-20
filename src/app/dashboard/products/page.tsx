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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";


const products = [
    { name: "Beginner Bodyweight", category: "Workout Plan", price: "$19.00", stock: 100 },
    { name: "Advanced Gym Routine", category: "Workout Plan", price: "$49.00", stock: 100 },
    { name: "Yoga for Flexibility", category: "Workout Plan", price: "$29.00", stock: 100 },
    { name: "HIIT Cardio", category: "Workout Plan", price: "$25.00", stock: 100 },
    { name: "Lean Bulk Meal Plan", category: "Nutrition", price: "$39.00", stock: 100 },
    { name: "Weight Loss Guide", category: "Nutrition", price: "$39.00", stock: 100 },
    { name: "Vegan Athlete Diet", category: "Nutrition", price: "$45.00", stock: 100 },
    { name: "Whey Protein", category: "Supplements", price: "$59.00", stock: 50 },
    { name: "Creatine Monohydrate", category: "Supplements", price: "$29.00", stock: 25 },
    { name: "Pre-Workout Fusion", category: "Supplements", price: "$45.00", stock: 75 },
];

export default function ProductsPage() {
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
                                <TableRow key={product.name}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
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
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
