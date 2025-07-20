'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, SkipForward, Repeat, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

const exercises = [
  { id: 1, name: 'Push-ups', sets: 3, reps: 12 },
  { id: 2, name: 'Squats', sets: 3, reps: 15 },
  { id: 3, name: 'Plank', sets: 3, reps: '60s' },
  { id: 4, name: 'Jumping Jacks', sets: 2, reps: 30 },
  { id: 5, name: 'Lunges', sets: 3, reps: 10 },
  { id: 6, name: 'Burpees', sets: 3, reps: 10 },
];

const WORK_SECONDS = 45;
const REST_SECONDS = 15;

export default function WorkoutPlayerPage({ params }: { params: { id: string } }) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState(WORK_SECONDS);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timer === 0) {
      if (isWorkPhase) {
        setCompletedExercises(prev => new Set(prev).add(exercises[currentExerciseIndex].id));
        setIsWorkPhase(false);
        setTimer(REST_SECONDS);
      } else {
        handleNext();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer, isWorkPhase, currentExerciseIndex]);

  const handleToggle = () => setIsActive(!isActive);
  const handleReset = () => {
    setIsActive(false);
    setIsWorkPhase(true);
    setTimer(WORK_SECONDS);
  };
  
  const handleNext = () => {
    const nextIndex = (currentExerciseIndex + 1) % exercises.length;
    setCurrentExerciseIndex(nextIndex);
    setIsActive(false);
    setIsWorkPhase(true);
    setTimer(WORK_SECONDS);
    if(nextIndex === 0) setIsActive(false); // Stop when cycle completes
  };

  const currentExercise = exercises[currentExerciseIndex];
  const totalSeconds = isWorkPhase ? WORK_SECONDS : REST_SECONDS;
  const progress = ( (totalSeconds - timer) / totalSeconds) * 100;

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Full Body Blast - Workout {params.id}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
             <div className="w-full aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center relative">
                <Image src="https://placehold.co/1280x720" layout="fill" objectFit='cover' alt="Workout video placeholder" className="rounded-lg" data-ai-hint="fitness workout" />
                <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
                <Button variant="ghost" size="icon" className="absolute h-20 w-20 text-white hover:bg-white/20 hover:text-white">
                    <Play className="h-12 w-12 fill-white"/>
                </Button>
            </div>
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
            </CardContent>
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
              <Button size="lg" className="w-full">Finish Workout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
