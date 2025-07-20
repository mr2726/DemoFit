import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Dumbbell, Apple, Package, Star } from "lucide-react";

const plans = [
    { title: "Beginner Bodyweight", price: "$19", tag: "4 Weeks", image: "https://placehold.co/600x400", aiHint: "bodyweight exercise" },
    { title: "Advanced Gym Routine", price: "$49", tag: "12 Weeks", image: "https://placehold.co/600x400", aiHint: "gym workout" },
    { title: "Yoga for Flexibility", price: "$29", tag: "8 Weeks", image: "https://placehold.co/600x400", aiHint: "yoga pose" },
    { title: "HIIT Cardio", price: "$25", tag: "6 Weeks", image: "https://placehold.co/600x400", aiHint: "HIIT cardio" },
];

const nutrition = [
    { title: "Lean Bulk Meal Plan", price: "$39", tag: "3000 kcal", image: "https://placehold.co/600x400", aiHint: "healthy meal" },
    { title: "Weight Loss Guide", price: "$39", tag: "1800 kcal", image: "https://placehold.co/600x400", aiHint: "salad bowl" },
    { title: "Vegan Athlete Diet", price: "$45", tag: "Plant-based", image: "https://placehold.co/600x400", aiHint: "vegan food" },
];

const supplements = [
    { title: "Whey Protein", price: "$59", tag: "2lbs", image: "https://placehold.co/600x400", aiHint: "protein powder" },
    { title: "Creatine Monohydrate", price: "$29", tag: "500g", image: "https://placehold.co/600x400", aiHint: "supplement jar" },
    { title: "Pre-Workout Fusion", price: "$45", tag: "30 Servings", image: "https://placehold.co/600x400", aiHint: "pre-workout drink" },
    { title: "Multivitamin Complex", price: "$22", tag: "90 Capsules", image: "https://placehold.co/600x400", aiHint: "vitamin pills" },
];

const MarketplaceCard = ({ item }: { item: { title: string; price: string; tag: string; image: string; aiHint: string; } }) => (
    <Card className="flex flex-col">
        <CardHeader className="p-0">
            <div className="relative h-48 w-full">
                <Image src={item.image} alt={item.title} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint={item.aiHint} />
                <Badge variant="secondary" className="absolute top-2 right-2">{item.tag}</Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-4">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span>4.8 (2.1k reviews)</span>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <span className="text-2xl font-bold">{item.price}</span>
            <Button>View Details</Button>
        </CardFooter>
    </Card>
)

export default function MarketplacePage() {
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
            <TabsContent value="plans">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                    {plans.map(item => <MarketplaceCard key={item.title} item={item} />)}
                </div>
            </TabsContent>
            <TabsContent value="nutrition">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                    {nutrition.map(item => <MarketplaceCard key={item.title} item={item} />)}
                </div>
            </TabsContent>
            <TabsContent value="supplements">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                    {supplements.map(item => <MarketplaceCard key={item.title} item={item} />)}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
