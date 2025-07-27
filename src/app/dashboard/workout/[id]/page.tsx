
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, SkipForward, Repeat, CheckCircle2, Loader2, FileText, PlayCircleIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import ReactPlayer from 'react-player/lazy';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps?: string;
    duration?: number;
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

const MediaDisplay = ({ exercise, workout }: { exercise?: Exercise, workout: WorkoutPlan }) => {
    const source = exercise?.videoOrDescription || workout.imageUrl || "https://placehold.co/1280x720";
    
    // Check if it's a likely video URL
    const isVideo = source.startsWith('http') && (source.includes('youtube.com') || source.includes('youtu.be') || source.includes('vimeo.com'));

    if (isVideo) {
         return (
            <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-black flex items-center justify-center">
                <ReactPlayer
                    url={source}
                    width="100%"
                    height="100%"
                    controls={false} // Use custom controls if needed, or true for default
                    playing={true}
                    light={true} // Shows thumbnail, loads player on click
                    playIcon={<PlayCircleIcon className="w-20 h-20 text-white/80 transition-transform group-hover:scale-110" />}
                    className="absolute top-0 left-0"
                />
            </div>
        );
    }
    
    if (source.startsWith('http')) {
        return (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                <img 
                    src={source}
                    alt={exercise?.name || workout.name} 
                    className="rounded-lg object-cover w-full h-full" 
                    data-ai-hint="fitness exercise" 
                />
            </div>
        );
    }

    return (
         <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-4">
            <FileText className="w-16 h-16 text-muted-foreground mb-4"/>
            <p className="text-muted-foreground text-center">{source}</p>
        </div>
    );
}

export default function WorkoutPlayerPage() {
  const params = useParams();
  const workoutId = params.id as string;
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(0);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
        if (!workoutId) return;
        setLoading(true);
        try {
            const docRef = doc(db, "products", workoutId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const exercisesWithIds = (data.exercises || []).map((ex: Omit<Exercise, 'id'>, index: number) => ({ ...ex, id: `${workoutId}-ex-${index}` }));
                const fetchedWorkout = { id: docSnap.id, ...data, exercises: exercisesWithIds } as WorkoutPlan;
                setWorkout(fetchedWorkout);
                if (fetchedWorkout.exercises.length > 0) {
                    setTimer(fetchedWorkout.exercises[0].duration || 0);
                }
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
  }, [workoutId, toast]);
  
  const exercises = workout?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isFinished && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isActive && !isFinished && timer === 0) {
      if (isWorkPhase) {
        setIsWorkPhase(false);
        setTimer(currentExercise?.rest || 0);
      } else {
        // Rest is done, pause the timer and wait for user to continue
        setIsActive(false); 
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer, isFinished, isWorkPhase, currentExercise]);


  const startNextPhase = () => {
     if (currentSet < (currentExercise?.sets || 1)) {
        setCurrentSet(prev => prev + 1);
        setIsWorkPhase(true);
        setTimer(currentExercise?.duration || 0);
    } else {
        if (currentExercise) {
            setCompletedExercises(prev => new Set(prev).add(currentExercise.id));
        }
        handleNext();
    }
  }

  const handleToggle = () => {
    if (isFinished || exercises.length === 0) return;

    if (isActive) { // Pausing
        setIsActive(false);
    } else { // Starting or resuming
        if (timer > 0) { // Resuming a countdown
             setIsActive(true);
        } else { // Timer is 0, means we are starting a new phase
            if (isWorkPhase) { // Starting a work phase
                 setIsActive(true);
                 if (!currentExercise?.duration || currentExercise.duration === 0) {
                     // If work is 0, immediately switch to rest
                     setIsWorkPhase(false);
                     setTimer(currentExercise?.rest || 0);
                 }
            } else { // Starting next set/exercise after rest
                startNextPhase();
                setIsActive(true);
            }
        }
    }
  }

  const startWorkout = () => {
    if (exercises.length === 0) return;
    setIsActive(true);
    setIsWorkPhase(true);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setCompletedExercises(new Set());
    setIsFinished(false);
    setTimer(exercises[0].duration || 0);
  }
  
  const handleReset = () => {
    setIsActive(false);
    startWorkout();
  };
  
  const handleNext = () => {
    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex >= exercises.length) {
        setIsFinished(true);
        setIsActive(false);
    } else {
        setCurrentExerciseIndex(nextIndex);
        setCurrentSet(1);
        setIsWorkPhase(true);
        setTimer(exercises[nextIndex].duration || 0);
        setIsActive(true);
    }
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

  const totalSeconds = isWorkPhase ? (currentExercise?.duration || 0) : (currentExercise?.rest || 0);
  const progress = totalSeconds > 0 ? ((totalSeconds - timer) / totalSeconds) * 100 : 0;
  
  const repDisplay = currentExercise?.reps ? `x ${currentExercise.reps}` : '';
  const setInfo = currentExercise ? `Set ${currentSet} / ${currentExercise.sets} ${repDisplay}` : '';

  const getTimerDisplay = () => {
      if (timer === 0 && !isActive && !isWorkPhase) {
          return 'Ready?';
      }
      return Math.max(0, timer);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{workout.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
             <div className="w-full aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center relative">
                <MediaDisplay exercise={currentExercise} workout={workout} />
            </div>
             {isFinished ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-green-500/10 rounded-lg text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-3xl font-bold">Workout Complete!</h2>
                    <p className="text-muted-foreground">Great job! You've completed all exercises.</p>
                     <Button size="lg" className="mt-6" onClick={handleReset}>Start Over</Button>
                </div>
            ) : currentExercise ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg text-center">
                    <h2 className="text-4xl font-bold tracking-tighter mb-2">{currentExercise.name}</h2>
                    <p className="text-2xl text-muted-foreground">{setInfo}</p>
                    
                    <div className="my-8">
                        <p className="text-lg uppercase tracking-widest text-primary font-semibold">{isWorkPhase ? 'Work' : 'Rest'}</p>
                        <div className="text-8xl font-mono font-bold tracking-tighter">{getTimerDisplay()}</div>
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
                    <h2 className="text-2xl font-bold">Ready to Start?</h2>
                    <p className="text-muted-foreground mb-6">Press start to begin your workout.</p>
                    <Button size="lg" onClick={startWorkout}><Play className="mr-2 h-5 w-5"/>Start Workout</Button>
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
                  onClick={() => {
                      setCurrentExerciseIndex(index);
                      setCurrentSet(1);
                      setIsWorkPhase(true);
                      setTimer(exercise.duration || 0);
                      setIsActive(true);
                      setIsFinished(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${currentExerciseIndex === index ? 'bg-primary/10' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-center">
                    {completedExercises.has(exercise.id) ? 
                        <CheckCircle2 className="h-6 w-6 text-primary mr-4" /> : 
                        <span className="h-6 w-6 text-muted-foreground mr-4 flex items-center justify-center font-bold">{index+1}</span>
                    }
                    <div>
                      <p className="font-semibold">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">{exercise.sets} sets x {exercise.reps || `${exercise.duration}s`}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="p-6 border-t">
              <Button size="lg" className="w-full" onClick={() => setIsFinished(true)}>Finish Workout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
