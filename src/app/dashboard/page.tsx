
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Flame, HeartPulse, Weight } from 'lucide-react';
import { ActivityCalendar } from '@/components/activity-calendar';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { format, subDays, startOfMonth, endOfMonth, eachMonthOfInterval, getMonth } from 'date-fns';

type ActivityData = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

const StatCard = ({ title, value, icon: Icon, description }: { title: string; value: string; icon: React.ElementType, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [currentWeight, setCurrentWeight] = useState<string>('-- kg');
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [calorieHistory, setCalorieHistory] = useState<any[]>([]);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch workout activity
    const fetchActivity = async () => {
        const today = new Date();
        const yearAgo = new Date();
        yearAgo.setFullYear(today.getFullYear() - 1);
        
        const userWorkoutsRef = collection(db, "user_workouts");
        const q = query(
            userWorkoutsRef, 
            where("userId", "==", user.uid),
            where("purchaseDate", ">=", Timestamp.fromDate(yearAgo))
        );
        const querySnapshot = await getDocs(q);
        
        const activityMap = new Map<string, number>();
        let weeklyCount = 0;
        const oneWeekAgo = subDays(today, 7);

        querySnapshot.forEach(doc => {
            const purchaseDate = doc.data().purchaseDate.toDate();
            const dateStr = format(purchaseDate, 'yyyy-MM-dd');
            activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);

            if (purchaseDate >= oneWeekAgo) {
                weeklyCount++;
            }
        });

        setWorkoutsThisWeek(weeklyCount);

        const data: ActivityData[] = Array.from(activityMap.entries()).map(([date, count]) => ({
            date,
            count,
            level: Math.min(4, count) as (0 | 1 | 2 | 3 | 4)
        }));
        
        // This part is just to fill the calendar, might not be accurate
         const fullData = Array.from({ length: 365 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 365 + i);
            const dateStr = date.toISOString().slice(0, 10);
            const existing = data.find(d => d.date === dateStr);
            return existing || { date: dateStr, count: 0, level: 0 };
        });

        setActivityData(fullData);
    };

    // Fetch tracking data (weight & calories)
    const fetchTrackingData = async () => {
        const today = new Date();
        const sixMonthsAgo = subDays(today, 180);
        
        const trackingRef = collection(db, 'user_tracking');
        const q = query(
            trackingRef,
            where("userId", "==", user.uid),
            where("date", ">=", format(sixMonthsAgo, 'yyyy-MM-dd')),
            orderBy("date", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const trackingDocs = querySnapshot.docs.map(d => ({...d.data(), id: d.id}));


        if (trackingDocs.length > 0) {
            // Current Weight
            const latestWeightDoc = trackingDocs.find(doc => doc.weight);
            if (latestWeightDoc) {
                setCurrentWeight(`${latestWeightDoc.weight} kg`);
            }

            // Weight History (last 6 months)
            const monthlyAverages: { [key: string]: { total: number, count: number } } = {};
            trackingDocs.forEach(doc => {
                if (doc.weight) {
                    const monthKey = format(new Date(doc.date), 'yyyy-MM');
                    if (!monthlyAverages[monthKey]) {
                        monthlyAverages[monthKey] = { total: 0, count: 0 };
                    }
                    monthlyAverages[monthKey].total += doc.weight;
                    monthlyAverages[monthKey].count++;
                }
            });
            
            const sortedMonths = Object.keys(monthlyAverages).sort();

            const weightChartData = sortedMonths.map(month => {
                const data = monthlyAverages[month];
                return {
                    date: format(new Date(month), 'MMM'),
                    weight: Math.round(data.total / data.count)
                }
            });
            setWeightHistory(weightChartData);
            
            // Calorie History (last 7 days)
            const last7Days = Array.from({length: 7}, (_, i) => format(subDays(today, i), 'yyyy-MM-dd')).reverse();
            const calorieChartData = last7Days.map(dateStr => {
                 const doc = trackingDocs.find(d => d.date === dateStr);
                 return {
                    day: format(new Date(dateStr), 'E'),
                    calories: doc?.calories || 0
                 }
            });
            setCalorieHistory(calorieChartData);
        }
    };
    
    fetchActivity();
    fetchTrackingData();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Weight" value={currentWeight} icon={Weight} />
        <StatCard title="Workouts This Week" value={workoutsThisWeek.toString()} icon={Activity} />
        <StatCard title="Calories Burned" value="1,280" icon={Flame} description='Estimated' />
        <StatCard title="Avg. Heart Rate" value="120 bpm" icon={HeartPulse} description='From last workout' />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
            <CardDescription>Your weight progress over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory}>
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
             <CardDescription>Your calories per day this week.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calorieHistory}>
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
            <CardDescription>Your workout purchase history over the past year.</CardDescription>
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
