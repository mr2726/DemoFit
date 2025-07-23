
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PlayCircle, Target, Star, Twitter, Instagram, Facebook, Users, Dumbbell, Zap } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';


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

const faqItems = [
    {
        question: "Is Fitness Hub suitable for beginners?",
        answer: "Absolutely! We offer a wide range of plans suitable for all fitness levels, including dedicated beginner programs. Each exercise comes with detailed instructions and video demonstrations to ensure you get started safely and effectively."
    },
    {
        question: "How are the workout plans personalized?",
        answer: "While our marketplace offers pre-designed expert plans, you can choose the ones that best fit your goals (e.g., weight loss, muscle gain, endurance). You track your progress, allowing you to see your improvements and decide when it's time to move to a more advanced plan."
    },
    {
        question: "Can I use the app on multiple devices?",
        answer: "Yes, your Fitness Hub account is synced across all your devices. You can log in on your phone, tablet, or computer to access your plans and track your progress anytime, anywhere."
    },
    {
        question: "What if I have dietary restrictions?",
        answer: "Our nutrition plans offer a variety of recipes. While we don't currently offer fully customized meal plans based on allergies, our recipe descriptions include detailed ingredient lists, allowing you to choose meals that fit your dietary needs."
    }
];


export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        {/* 1. Value Proposition & Main Offer (Hero) */}
        <section className="relative bg-background py-20 md:py-32 flex items-center justify-center text-center px-4">
            <div className="relative z-10">
                 <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-foreground">
                    Stop Guessing. Start Transforming.
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                    Unlock your potential with AI-driven workout plans, personalized nutrition guides, and premium supplements. Your all-in-one fitness solution awaits.
                  </p>
                  <div className="mt-8">
                    <Button size="lg" asChild>
                      <Link href="/login">Start Your Free Trial</Link>
                    </Button>
                  </div>
            </div>
        </section>

        {/* 2. Social Proof */}
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">10,000+</p>
                        <p className="text-muted-foreground">Active Members</p>
                    </div>
                     <div>
                        <Dumbbell className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">50+</p>
                        <p className="text-muted-foreground">Unique Plans</p>
                    </div>
                     <div>
                        <Zap className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">98%</p>
                        <p className="text-muted-foreground">User Satisfaction</p>
                    </div>
                     <div>
                        <Star className="h-8 w-8 mx-auto text-primary mb-2 fill-primary" />
                        <p className="text-2xl font-bold">4.9/5</p>
                        <p className="text-muted-foreground">Average Rating</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* 3. Product Service or Features (Benefits & Advantages) */}
        <section id="features" className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">The Last Fitness App You'll Ever Need</h2>
                <p className="mt-2 text-muted-foreground">We combined cutting-edge technology with proven fitness principles.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">AI-Powered Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Never plateau again. Our smart algorithm adjusts your workouts and nutrition based on your progress.
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
                    Stay motivated with video-guided exercises, automatic timers, and seamless progress tracking for every set.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Track Everything</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize your success. Monitor weight, calories, workout streaks, and personal bests, all in one dashboard.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. Testimonials */}
        <section className="py-20 overflow-hidden bg-background">
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
        
        {/* 5. Objection Handling (FAQs) */}
        <section className="bg-muted py-20">
            <div className="container mx-auto max-w-3xl px-4">
                 <h2 className="text-center text-3xl font-bold">Your Questions, Answered</h2>
                 <p className="mt-2 text-center text-muted-foreground">Clearing up the common concerns about joining Fitness Hub.</p>
                 <Accordion type="single" collapsible className="w-full mt-12">
                    {faqItems.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index + 1}`}>
                            <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
            </div>
        </section>
        
        {/* 6. Additional Call-to-Action */}
         <section className="py-20 bg-primary text-primary-foreground">
            <div className="container mx-auto max-w-3xl px-4 text-center">
                 <h2 className="text-center text-3xl font-bold">Ready to Build Your Best Body?</h2>
                 <p className="mt-2 text-center text-primary-foreground/80 mx-auto max-w-xl">Join thousands of others who have transformed their lives with Fitness Hub. Your first week is on us.</p>
                 <div className="mt-8">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/login">Claim Your Free Week</Link>
                    </Button>
                 </div>
            </div>
        </section>

      </main>

      {/* 7. Simple Footer */}
      <footer className="border-t bg-muted">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6">
            <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">&copy; 2024 Fitness Hub. All rights reserved.</p>
                <a href="mailto:contact@fitnesshub.com" className="text-sm text-muted-foreground hover:text-foreground">
                    contact@fitnesshub.com
                </a>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex justify-center gap-4">
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                    </Link>
                     <Link href="#" className="text-muted-foreground hover:text-primary">
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                    </Link>
                     <Link href="#" className="text-muted-foreground hover:text-primary">
                        <Facebook className="h-5 w-5" />
                        <span className="sr-only">Facebook</span>
                    </Link>
                </div>
                <Separator orientation="vertical" className="h-6 bg-border" />
                <div className="flex gap-4">
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                    </Link>
                </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
