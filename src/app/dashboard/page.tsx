'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Flame, HeartPulse, Weight } from 'lucide-react';
import { ActivityCalendar } from '@/components/activity-calendar';
import { useState, useEffect } from 'react';


const weightData = [
  { date: 'Jan', weight: 80 },
  { date: 'Feb', weight: 78 },
  { date: 'Mar', weight: 79 },
  { date: 'Apr', weight: 77 },
  { date: 'May', weight: 76 },
  { date: 'Jun', weight: 75 },
];

const caloriesData = [
  { day: 'Mon', calories: 2200 },
  { day: 'Tue', calories: 2100 },
  { day: 'Wed', calories: 2300 },
  { day: 'Thu', calories: 2400 },
  { day: 'Fri', calories: 2150 },
  { day: 'Sat', calories: 2500 },
  { day: 'Sun', calories: 2350 },
];

type ActivityData = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  useEffect(() => {
    const data = Array.from({ length: 365 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 365 + i);
        return {
          date: date.toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 5),
          level: (Math.floor(Math.random() * 5)) as (0 | 1 | 2 | 3 | 4),
        };
    });
    setActivityData(data);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Weight" value="75 kg" icon={Weight} />
        <StatCard title="Workouts This Week" value="4" icon={Activity} />
        <StatCard title="Calories Burned" value="1,280" icon={Flame} />
        <StatCard title="Avg. Heart Rate" value="120 bpm" icon={HeartPulse} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
            <CardDescription>Your weight progress over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))'
                    }}
                />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Calorie Intake</CardTitle>
             <CardDescription>Your average calories per day this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))'
                    }}
                />
                <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Workout Activity</CardTitle>
            <CardDescription>Your workout consistency over the past year.</CardDescription>
          </CardHeader>
          <CardContent>
            {activityData.length > 0 ? (
                <ActivityCalendar data={activityData} />
            ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground">Loading activity...</div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
