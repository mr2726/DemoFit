
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, SkipForward, Repeat, CheckCircle2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    videoOrDescription: string;
    rest: number;
}

interface WorkoutPlan {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    exercises: Exercise[];
}

const WORK_SECONDS = 45;
const REST_SECONDS = 15;

export default function WorkoutPlayerPage({ params }: { params: { id: string } }) {
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(WORK_SECONDS);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
        if (!params.id) return;
        setLoading(true);
        try {
            const docRef = doc(db, "products", params.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Firestore doesn't store a top-level ID, and exercises need unique IDs for keys
                const exercisesWithIds = (data.exercises || []).map((ex: Omit<Exercise, 'id'>, index: number) => ({ ...ex, id: `${params.id}-ex-${index}` }));
                setWorkout({ id: docSnap.id, ...data, exercises: exercisesWithIds } as WorkoutPlan);
            } else {
                toast({ title: "Error", description: "Workout plan not found.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error fetching workout:", error);
            toast({ title: "Error", description: "Failed to load the workout plan.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    fetchWorkout();
  }, [params.id, toast]);
  
  const exercises = workout?.exercises || [];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timer === 0) {
      if (isWorkPhase) {
        if(exercises.length > 0) {
            setCompletedExercises(prev => new Set(prev).add(exercises[currentExerciseIndex].id));
        }
        setIsWorkPhase(false);
        const currentRest = exercises[currentExerciseIndex]?.rest || REST_SECONDS;
        setTimer(currentRest);
      } else {
        handleNext();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timer, isWorkPhase, currentExerciseIndex, exercises]);

  const handleToggle = () => {
    if (exercises.length === 0) return;
    setIsActive(!isActive);
  }
  
  const handleReset = () => {
    if (exercises.length === 0) return;
    setIsActive(false);
    setIsWorkPhase(true);
    setTimer(WORK_SECONDS);
  };
  
  const handleNext = () => {
    if (exercises.length === 0) return;
    const nextIndex = (currentExerciseIndex + 1);
    if (nextIndex >= exercises.length) {
        // Workout finished
        setIsActive(false);
        setCurrentExerciseIndex(0); // Optionally reset to start
    } else {
        setCurrentExerciseIndex(nextIndex);
    }
    
    setIsActive(true); // Auto-start next exercise
    setIsWorkPhase(true);
    setTimer(WORK_SECONDS);
  };

  if (loading) {
    return (
        <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!workout) {
    return (
        <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>Workout Not Found</CardTitle>
                    <CardContent>This workout could not be loaded. Please go back and try again.</CardContent>
                </CardHeader>
            </Card>
        </div>
    )
  }

  const currentExercise = exercises[currentExerciseIndex];
  const totalSeconds = isWorkPhase ? WORK_SECONDS : (currentExercise?.rest || REST_SECONDS);
  const progress = ( (totalSeconds - timer) / totalSeconds) * 100;
  const isFinished = completedExercises.size === exercises.length && exercises.length > 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{workout.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
             <div className="w-full aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center relative">
                <Image 
                    src={currentExercise?.videoOrDescription && (currentExercise.videoOrDescription.startsWith('http') || currentExercise.videoOrDescription.startsWith('/')) ? currentExercise.videoOrDescription : workout.imageUrl || "https://placehold.co/1280x720"} 
                    layout="fill" 
                    objectFit='cover' 
                    alt="Workout video placeholder" 
                    className="rounded-lg" 
                    data-ai-hint="fitness workout" 
                />
                <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
                <Button variant="ghost" size="icon" className="absolute h-20 w-20 text-white hover:bg-white/20 hover:text-white">
                    <Play className="h-12 w-12 fill-white"/>
                </Button>
            </div>
             {isFinished ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-green-500/10 rounded-lg text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-3xl font-bold">Workout Complete!</h2>
                    <p className="text-muted-foreground">Great job! You've completed all exercises.</p>
                     <Button size="lg" className="mt-6" onClick={() => {
                         setCurrentExerciseIndex(0);
                         setCompletedExercises(new Set());
                         setIsActive(false);
                         setIsWorkPhase(true);
                         setTimer(WORK_SECONDS);
                     }}>Start Over</Button>
                </div>
            ) : currentExercise ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg text-center">
                    <h2 className="text-4xl font-bold tracking-tighter mb-2">{currentExercise.name}</h2>
                    <p className="text-2xl text-muted-foreground">{currentExercise.sets} sets x {currentExercise.reps} reps</p>
                    
                    <div className="my-8">
                        <p className="text-lg uppercase tracking-widest text-primary font-semibold">{isWorkPhase ? 'Work' : 'Rest'}</p>
                        <p className="text-8xl font-mono font-bold tracking-tighter">{timer}</p>
                    </div>

                    <Progress value={progress} className="w-full max-w-md h-2" />

                    <div className="flex items-center gap-4 mt-8">
                        <Button variant="outline" size="lg" onClick={handleReset}><Repeat className="mr-2 h-5 w-5"/>Reset</Button>
                        <Button size="lg" onClick={handleToggle}>
                            {isActive ? <><Pause className="mr-2 h-5 w-5"/>Pause</> : <><Play className="mr-2 h-5 w-5"/>Start</>}
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleNext}><SkipForward className="mr-2 h-5 w-5"/>Next</Button>
                    </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg text-center">
                    <h2 className="text-2xl font-bold">No Exercises Found</h2>
                    <p className="text-muted-foreground">This workout plan doesn't have any exercises yet.</p>
                </div>
             )}
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Exercise List</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 h-0">
            <div className="p-6 pt-0">
              {exercises.map((exercise, index) => (
                <button
                  key={exercise.id}
                  onClick={() => setCurrentExerciseIndex(index)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${currentExerciseIndex === index ? 'bg-primary/10' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-center">
                    {completedExercises.has(exercise.id) ? 
                        <CheckCircle2 className="h-6 w-6 text-primary mr-4" /> : 
                        <span className="h-6 w-6 text-muted-foreground mr-4 flex items-center justify-center font-bold">{index+1}</span>
                    }
                    <div>
                      <p className="font-semibold">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">{exercise.sets} sets x {exercise.reps} reps</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="p-6 border-t">
              <Button size="lg" className="w-full" onClick={() => setCompletedExercises(new Set(exercises.map(e => e.id)))}>Finish Workout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
