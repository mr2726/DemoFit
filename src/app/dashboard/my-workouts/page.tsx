import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";

const workoutPlans = [
    {
        title: "Full Body Blast",
        description: "A 4-week plan to build strength and endurance. Perfect for beginners.",
        image: "https://placehold.co/600x400",
        aiHint: "full body workout"
    },
    {
        title: "Advanced Abs",
        description: "Sculpt your core with this intense 8-week abdominal program.",
        image: "https://placehold.co/600x400",
        aiHint: "ab workout"
    },
];


export default function MyWorkoutsPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">My Workouts</h1>
                <p className="text-muted-foreground">Your active and purchased workout plans. Let's get to it!</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workoutPlans.map((plan) => (
                    <Card key={plan.title}>
                        <CardHeader>
                            <div className="relative h-40 w-full">
                                <Image
                                    src={plan.image}
                                    alt={plan.title}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-t-lg"
                                    data-ai-hint={plan.aiHint}
                                />
                            </div>
                            <CardTitle className="pt-4">{plan.title}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/workout/1">
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Start Workout
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
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
            </div>
        </div>
    );
}
