
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, NotebookPen } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { format } from 'date-fns';

interface NutritionPlan {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    totalKcal?: number;
    category: "Workout Plan" | "Nutrition" | "Supplements";
}

interface TrackingData {
    userId: string;
    date: string;
    weight?: number;
    calories?: number;
}

export default function NutritionTrackingPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [weight, setWeight] = useState<string>('');
    const [calories, setCalories] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const today = format(new Date(), 'yyyy-MM-dd');

    const fetchTrackingData = useCallback(async () => {
        if (!user) return;
        const trackingDocRef = doc(db, 'user_tracking', `${user.uid}_${today}`);
        const docSnap = await getDoc(trackingDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            setWeight(data.weight?.toString() || '');
            setCalories(data.calories?.toString() || '');
        }
    }, [user, today]);

    useEffect(() => {
        const fetchNutritionPlans = async () => {
            if (!user) {
                setLoading(false);
                return;
            };
            
            setLoading(true);
            try {
                // Fetch purchased product IDs
                const userWorkoutsRef = collection(db, "user_workouts");
                const q = query(userWorkoutsRef, where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                
                const planPromises = querySnapshot.docs.map(async (userWorkoutDoc) => {
                    const productId = userWorkoutDoc.data().productId;
                    const productRef = doc(db, "products", productId);
                    const productSnap = await getDoc(productRef);
                    if (productSnap.exists() && productSnap.data().category === 'Nutrition') {
                        return { id: productSnap.id, ...productSnap.data() } as NutritionPlan;
                    }
                    return null;
                });
                
                const resolvedPlans = (await Promise.all(planPromises)).filter(Boolean) as NutritionPlan[];
                setNutritionPlans(resolvedPlans);
                
                // Fetch today's tracking data
                await fetchTrackingData();

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load your nutrition data.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchNutritionPlans();

    }, [user, toast, fetchTrackingData]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const trackingDocRef = doc(db, 'user_tracking', `${user.uid}_${today}`);
            const data: TrackingData = {
                userId: user.uid,
                date: today
            };
            if (weight) data.weight = parseFloat(weight);
            if (calories) data.calories = parseInt(calories, 10);
            
            await setDoc(trackingDocRef, data, { merge: true });
            toast({ title: "Success", description: "Your tracking data has been saved." });
        } catch (error) {
            console.error("Error saving data:", error);
            toast({ title: "Error", description: "Failed to save data.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    const handleAutofillCalories = (kcal: number) => {
        setCalories(kcal.toString());
    }

    if (loading) {
        return (
             <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-headline">Nutrition Tracking</h1>
                <p className="text-muted-foreground">Log your daily weight and calorie intake to stay on track.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Log - {format(new Date(), 'MMMM d, yyyy')}</CardTitle>
                    <CardDescription>Enter your current weight and total calories consumed today.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input id="weight" type="number" placeholder="e.g., 75.5" value={weight} onChange={e => setWeight(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="calories">Calories (kcal)</Label>
                            <Input id="calories" type="number" placeholder="e.g., 2200" value={calories} onChange={e => setCalories(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <NotebookPen className="mr-2 h-4 w-4" />}
                        Save Log
                    </Button>
                </CardFooter>
            </Card>

            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">My Nutrition Plans</h2>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {nutritionPlans.length > 0 ? (
                        nutritionPlans.map((plan) => (
                            <Card key={plan.id} className="flex flex-col">
                                <img
                                    src={plan.imageUrl || "https://placehold.co/600x400"}
                                    alt={plan.name}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                    data-ai-hint="nutrition food"
                                />
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>{plan.totalKcal} kcal</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto">
                                    <Button className="w-full" onClick={() => handleAutofillCalories(plan.totalKcal || 0)}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Today's Intake
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                         <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50 col-span-full h-48">
                            <CardHeader className="text-center">
                                <CardTitle>No nutrition plans found</CardTitle>
                                <CardDescription>Purchase a nutrition plan from the marketplace to get started.</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                 </div>
            </div>
        </div>
    );
}
