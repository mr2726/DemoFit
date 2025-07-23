
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Order {
    id: string;
    productName: string;
    price: number;
    purchaseDate: {
        seconds: number;
        nanoseconds: number;
    };
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';
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

export default function MyOrdersPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, where('userId', '==', user.uid), orderBy('purchaseDate', 'desc'));
                const querySnapshot = await getDocs(q);

                const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast({
                    title: "Error",
                    description: "Failed to load your orders.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, toast]);
    
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
                <h1 className="text-3xl font-bold font-headline">My Orders</h1>
                <p className="text-muted-foreground">Track the status of your supplement orders.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>A list of all your supplement purchases.</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Shipping To</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.productName}</TableCell>
                                        <TableCell>{format(new Date(order.purchaseDate.seconds * 1000), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </TableCell>
                                        <TableCell>${order.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{order.shipping?.name}</div>
                                                <div className="text-muted-foreground">
                                                    {order.shipping?.address.line1}, {order.shipping?.address.city}, {order.shipping?.address.state} {order.shipping?.address.postal_code}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50 h-48 rounded-lg">
                            <Package className="h-12 w-12 text-muted-foreground" />
                            <h3 className="text-xl font-semibold mt-4">No Orders Found</h3>
                            <p className="text-muted-foreground mt-1">You haven't ordered any supplements yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
