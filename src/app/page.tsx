
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PlayCircle, Target, Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";


const LandingHeader = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 max-w-screen-2xl items-center">
      <Link href="/" className="flex items-center gap-2 font-bold">
        <Target className="h-6 w-6 text-primary" />
        <span className="text-lg">Fitness Hub</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </nav>
    </div>
  </header>
);

const testimonials = [
    {
        name: "Jane Smith",
        quote: "Fitness Hub changed my life. The plans are easy to follow and the results are real. I've never felt better!"
    },
    {
        name: "Mike Davis",
        quote: "The workout player is a game-changer. It keeps me focused and pushing my limits. Highly recommend!"
    },
    {
        name: "Chloe Wilson",
        quote: "Finally, a fitness app that has it all. Great workouts, delicious recipes, and quality supplements in one place."
    },
    {
        name: "Alex Johnson",
        quote: "The progress tracking is incredibly motivating. Seeing my stats improve week by week keeps me coming back."
    },
    {
        name: "Samantha Bee",
        quote: "I love the nutrition section! The recipes are delicious and have helped me understand my macros so much better."
    },
    {
        name: "Tom Richards",
        quote: "As someone who is always busy, the efficiency of the workouts is a huge plus. Maximum results in minimum time."
    }
];

const FiveStars = () => (
    <div className="flex items-center gap-1 text-primary">
        <Star className="w-5 h-5 fill-current" />
        <Star className="w-5 h-5 fill-current" />
        <Star className="w-5 h-5 fill-current" />
        <Star className="w-5 h-5 fill-current" />
        <Star className="w-5 h-5 fill-current" />
    </div>
);


export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center md:py-32">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Transform Your Body, Elevate Your Life
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Discover personalized fitness plans, expert nutrition guidance, and premium supplements. Your journey to a healthier you starts here.
          </p>
          <div className="mt-8 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/login">Start Your Journey</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Why Fitness Hub?</h2>
            <p className="mt-2 text-center text-muted-foreground">Everything you need to achieve your fitness goals.</p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Personalized Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get workout and meal plans tailored to your body and goals, designed by certified professionals.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PlayCircle className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Interactive Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Follow along with video-guided workouts, timers, and progress tracking to stay motivated.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Track Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize your success with detailed stats on weight, calories, and workout consistency.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Image Showcase */}
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-2xl">
                    <Image
                        src="https://placehold.co/1200x600"
                        alt="Fitness workout"
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="fitness workout"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h3 className="text-4xl font-bold text-white">Reach Your Peak Performance</h3>
                    </div>
                </div>
            </div>
        </section>


        {/* Testimonials Section */}
        <section className="bg-muted py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold">Loved by Our Community</h2>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 2000,
                        stopOnInteraction: false,
                    }),
                ]}
                className="w-full mt-12"
            >
                <CarouselContent>
                    {testimonials.map((testimonial, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                             <div className="p-1">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <FiveStars />
                                            <p className="text-muted-foreground italic">
                                                "{testimonial.quote}"
                                            </p>
                                            <p className="font-semibold text-right">- {testimonial.name}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <p className="text-sm text-muted-foreground">&copy; 2024 Fitness Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
