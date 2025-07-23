
'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingCart, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subMonths, startOfMonth } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string; value: string; icon: React.ElementType, description?: string, isLoading?: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="h-10 flex items-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </>
            )}
        </CardContent>
    </Card>
);

interface SalesData {
    name: string;
    value: number;
}

interface RevenueData {
    month: string;
    revenue: number;
}


export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [newCustomers, setNewCustomers] = useState(0);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);


    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                // Fetch all necessary data in parallel
                const [usersSnapshot, ordersSnapshot, userWorkoutsSnapshot, productsSnapshot] = await Promise.all([
                    getDocs(collection(db, 'users')),
                    getDocs(collection(db, 'orders')),
                    getDocs(collection(db, 'user_workouts')),
                    getDocs(collection(db, 'products')),
                ]);
                
                // --- Process Products ---
                const productsMap = new Map();
                productsSnapshot.forEach(doc => productsMap.set(doc.id, doc.data()));

                // --- Process Customers ---
                setNewCustomers(usersSnapshot.size);

                const orders = ordersSnapshot.docs.map(doc => doc.data());
                const userWorkouts = userWorkoutsSnapshot.docs.map(doc => doc.data());

                // --- Process Sales & Revenue ---
                let calculatedRevenue = 0;
                const salesCount = { 'Workout Plan': 0, 'Nutrition': 0, 'Supplements': 0 };
                const monthlyRevenue: { [key: string]: number } = {};
                
                // Initialize last 6 months
                for (let i = 5; i >= 0; i--) {
                    const monthKey = format(subMonths(new Date(), i), 'MMM');
                    monthlyRevenue[monthKey] = 0;
                }

                // Process supplement orders
                orders.forEach(order => {
                    calculatedRevenue += order.price || 0;
                    salesCount['Supplements']++;
                    if (order.purchaseDate) {
                        const monthKey = format(order.purchaseDate.toDate(), 'MMM');
                        if (monthKey in monthlyRevenue) {
                            monthlyRevenue[monthKey] += order.price || 0;
                        }
                    }
                });

                // Process digital product purchases
                userWorkouts.forEach(workout => {
                    const product = productsMap.get(workout.productId);
                    if (product) {
                        calculatedRevenue += product.price || 0;
                        if (product.category in salesCount) {
                            salesCount[product.category as keyof typeof salesCount]++;
                        }
                        if (workout.purchaseDate) {
                             const monthKey = format(workout.purchaseDate.toDate(), 'MMM');
                             if (monthKey in monthlyRevenue) {
                                monthlyRevenue[monthKey] += product.price || 0;
                            }
                        }
                    }
                });

                setTotalRevenue(calculatedRevenue);
                setTotalSales(orders.length + userWorkouts.length);
                setSalesData([
                    { name: 'Workout Plans', value: salesCount['Workout Plan'] },
                    { name: 'Nutrition', value: salesCount['Nutrition'] },
                    { name: 'Supplements', value: salesCount['Supplements'] },
                ]);

                const formattedRevenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
                    month,
                    revenue,
                }));
                setRevenueData(formattedRevenueData);

            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Analytics</h1>
                <p className="text-muted-foreground">Your business at a glance. Sales, revenue, and customer insights.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Total Revenue" 
                    value={`$${totalRevenue.toFixed(2)}`} 
                    icon={DollarSign} 
                    isLoading={loading}
                />
                <StatCard 
                    title="Total Sales" 
                    value={`+${totalSales}`} 
                    icon={ShoppingCart}
                    isLoading={loading}
                />
                <StatCard 
                    title="New Customers" 
                    value={`+${newCustomers}`}
                    icon={Users}
                    isLoading={loading}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Your revenue performance over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                         {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            borderColor: 'hsl(var(--border))'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                         )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Sales Breakdown</CardTitle>
                        <CardDescription>What are your customers buying?</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center">
                         {loading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={salesData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={110}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {salesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            borderColor: 'hsl(var(--border))',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
