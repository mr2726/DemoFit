
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Truck, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';

interface Order {
    id: string;
    productName: string;
    userId: string;
    price: number;
    purchaseDate: {
        seconds: number;
        nanoseconds: number;
    };
    status: OrderStatus;
    shipping: {
        name: string;
        address: {
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        }
    }
}

export default function AdminOrdersPage() {
    const { isAdmin } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, orderBy('purchaseDate', 'desc'));
            const querySnapshot = await getDocs(q);

            const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({
                title: "Error",
                description: "Failed to load orders.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchOrders();
        }
    }, [isAdmin, toast]);

    const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
        setUpdatingStatus(orderId);
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status });
            toast({ title: 'Success', description: `Order status updated to ${status}.`});
            fetchOrders(); // Refresh data
        } catch (error) {
             console.error("Error updating status:", error);
            toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
        } finally {
            setUpdatingStatus(null);
        }
    }
    
    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Processing':
                return 'secondary';
            case 'Shipped':
                return 'default';
            case 'Delivered':
                return 'outline';
            case 'Canceled':
                return 'destructive';
            default:
                return 'secondary';
        }
    }

    if (!isAdmin) {
        return <p>You do not have access to this page.</p>;
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Manage Orders</h1>
                <p className="text-muted-foreground">View and manage all supplement orders.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>A list of all supplement purchases.</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                             <div className="font-medium">{order.shipping?.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order.shipping?.address.line1}, {order.shipping?.address.city}, {order.shipping?.address.state} {order.shipping?.address.postal_code}
                                                </div>
                                        </TableCell>
                                        <TableCell>{order.productName}</TableCell>
                                        <TableCell>{format(new Date(order.purchaseDate.seconds * 1000), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </TableCell>
                                        <TableCell>${order.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={updatingStatus === order.id}>
                                                        {updatingStatus === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                     <DropdownMenuItem onSelect={() => handleUpdateStatus(order.id, 'Processing')}>Processing</DropdownMenuItem>
                                                     <DropdownMenuItem onSelect={() => handleUpdateStatus(order.id, 'Shipped')}>Shipped</DropdownMenuItem>
                                                     <DropdownMenuItem onSelect={() => handleUpdateStatus(order.id, 'Delivered')}>Delivered</DropdownMenuItem>
                                                     <DropdownMenuItem onSelect={() => handleUpdateStatus(order.id, 'Canceled')} className="text-destructive">Canceled</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50 h-48 rounded-lg">
                            <Truck className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-xl font-semibold mt-4">No Orders Yet</h3>
                            <p className="text-muted-foreground mt-1">New orders will appear here as they come in.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
