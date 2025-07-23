
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Loader2, FileText, PlusCircle } from 'lucide-react';
import { doc, getDoc, setDoc, increment, getFirestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { format } from 'date-fns';

interface Recipe {
    id: string;
    name: string;
    instructions: string;
    imageUrl?: string;
    kcal?: number;
}

interface NutritionPlan {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    recipes: Recipe[];
}

const MediaDisplay = ({ recipe, plan }: { recipe?: Recipe, plan: NutritionPlan }) => {
    const source = recipe?.imageUrl || plan.imageUrl || "https://placehold.co/1280x720";
    
    if (source.startsWith('http')) {
        return (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                <img 
                    src={source}
                    alt={recipe?.name || plan.name} 
                    className="rounded-lg object-cover w-full h-full" 
                    data-ai-hint="nutrition food" 
                />
            </div>
        );
    }

    return (
         <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-4">
            <FileText className="w-16 h-16 text-muted-foreground mb-4"/>
            <p className="text-muted-foreground text-center">No image for this recipe.</p>
        </div>
    );
}

export default function NutritionPlanPage() {
    const params = useParams();
    const planId = params.id as string;
    const { user } = useAuth();
    const [plan, setPlan] = useState<NutritionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLogging, setIsLogging] = useState<string | null>(null); // holds recipe id being logged
    const { toast } = useToast();

    const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId) return;
            setLoading(true);
            try {
                const docRef = doc(db, "products", planId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const recipesWithIds = (data.recipes || []).map((rec: Omit<Recipe, 'id'>, index: number) => ({ ...rec, id: `${planId}-rec-${index}` }));
                    const fetchedPlan = { id: docSnap.id, ...data, recipes: recipesWithIds } as NutritionPlan;
                    setPlan(fetchedPlan);
                } else {
                    toast({ title: "Error", description: "Nutrition plan not found.", variant: "destructive" });
                }
            } catch (error) {
                console.error("Error fetching plan:", error);
                toast({ title: "Error", description: "Failed to load the nutrition plan.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [planId, toast]);
    
    const recipes = plan?.recipes || [];
    const currentRecipe = recipes[currentRecipeIndex];

    const handleLogMeal = async (recipe: Recipe) => {
        if (!user || !recipe.kcal) {
             toast({ title: "Info", description: "This meal has no calories to log.", variant: "default" });
            return;
        }
        setIsLogging(recipe.id);

        const today = format(new Date(), 'yyyy-MM-dd');
        const trackingDocRef = doc(db, 'user_tracking', `${user.uid}_${today}`);

        try {
            await setDoc(trackingDocRef, {
                calories: increment(recipe.kcal),
                userId: user.uid,
                date: today
            }, { merge: true });

            toast({
                title: "Meal Logged!",
                description: `${recipe.name} (${recipe.kcal} kcal) added to your daily total.`,
            });
        } catch (error) {
            console.error("Error logging meal:", error);
            toast({ title: "Error", description: "Failed to log your meal.", variant: "destructive" });
        } finally {
            setIsLogging(null);
        }
    };


    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Plan Not Found</CardTitle>
                        <CardContent>This nutrition plan could not be loaded. Please go back and try again.</CardContent>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="flex-1 flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <MediaDisplay recipe={currentRecipe} plan={plan} />
                {currentRecipe ? (
                    <div className="flex-1 flex flex-col mt-4">
                        <div className="flex justify-between items-center mb-2">
                             <h2 className="text-2xl font-bold tracking-tighter">{currentRecipe.name}</h2>
                             <span className="font-bold text-lg text-primary">{currentRecipe.kcal ? `${currentRecipe.kcal} kcal` : ''}</span>
                        </div>
                        <ScrollArea className="flex-1 pr-4 -mr-4">
                             <p className="text-muted-foreground whitespace-pre-wrap">{currentRecipe.instructions}</p>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg text-center">
                        <h2 className="text-2xl font-bold">No Recipes in this Plan</h2>
                        <p className="text-muted-foreground mb-6">Select a recipe from the list to view its details.</p>
                    </div>
                )}
            </CardContent>
            {currentRecipe && (
                <CardFooter>
                    <Button 
                        size="lg"
                        className="w-full"
                        onClick={() => handleLogMeal(currentRecipe)} 
                        disabled={isLogging === currentRecipe.id}
                    >
                         {isLogging === currentRecipe.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                            <PlusCircle className="mr-2 h-4 w-4" />
                         )}
                        Log Meal
                    </Button>
                </CardFooter>
            )}
            </Card>
        </div>

        <Card className="flex flex-col">
            <CardHeader>
            <CardTitle>Recipe List</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 h-0">
                <div className="p-6 pt-0">
                {recipes.map((recipe, index) => (
                    <button
                    key={recipe.id}
                    onClick={() => setCurrentRecipeIndex(index)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${currentRecipeIndex === index ? 'bg-primary/10' : 'hover:bg-muted'}`}
                    >
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="font-semibold">{recipe.name}</p>
                        <p className="text-sm text-muted-foreground">{recipe.kcal ? `${recipe.kcal} kcal` : 'N/A'}</p>
                        </div>
                        {isLogging === recipe.id && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                    </div>
                    </button>
                ))}
                </div>
            </ScrollArea>
            </CardContent>
        </Card>
        </div>
    );
}

