
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface WorkoutPlan {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    category: "Workout Plan" | "Nutrition" | "Supplements";
}

export default function MyWorkoutsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkouts = async () => {
            if (!user) {
                setLoading(false);
                return;
            };

            setLoading(true);
            try {
                const userWorkoutsRef = collection(db, "user_workouts");
                const q = query(userWorkoutsRef, where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);

                const workoutPromises = querySnapshot.docs.map(async (userWorkoutDoc) => {
                    const productId = userWorkoutDoc.data().productId;
                    const productRef = doc(db, "products", productId);
                    const productSnap = await getDoc(productRef);
                    if (productSnap.exists() && productSnap.data().category === 'Workout Plan') {
                        return { id: productSnap.id, ...productSnap.data() } as WorkoutPlan;
                    }
                    return null;
                });
                
                const resolvedWorkouts = (await Promise.all(workoutPromises)).filter(Boolean) as WorkoutPlan[];
                setWorkouts(resolvedWorkouts);

            } catch (error) {
                console.error("Error fetching workouts:", error);
                toast({
                    title: "Error",
                    description: "Failed to load your workout plans.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();

    }, [user, toast]);

    if (loading) {
        return (
             <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">My Workouts</h1>
                <p className="text-muted-foreground">Your active and purchased workout plans. Let's get to it!</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workouts.length > 0 ? (
                    workouts.map((plan) => (
                        <Card key={plan.id} className="flex flex-col">
                            <div className="relative h-48 w-full">
                                <Image
                                    src={plan.imageUrl || "https://placehold.co/600x400"}
                                    alt={plan.name}
                                    fill
                                    className="rounded-t-lg object-cover"
                                    data-ai-hint="fitness workout"
                                />
                            </div>
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto">
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/workout/${plan.id}`}>
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Start Workout
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                     <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50 col-span-full h-64">
                        <CardHeader className="text-center">
                            <CardTitle>No workout plans yet!</CardTitle>
                            <CardDescription>Explore our marketplace to find your next challenge.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/marketplace">Explore Plans</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}
                 
                 {workouts.length > 0 && (
                     <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50">
                        <CardHeader className="text-center">
                            <CardTitle>Looking for a new challenge?</CardTitle>
                            <CardDescription>Explore our marketplace for more workout plans.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/marketplace">Explore Plans</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                 )}
            </div>
        </div>
    );
}
