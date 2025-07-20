import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ActivityData = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export const ActivityCalendar = ({ data }: { data: ActivityData[] }) => {
  const today = new Date();
  const yearAgo = new Date();
  yearAgo.setFullYear(today.getFullYear() - 1);

  const days = [];
  let day = new Date(yearAgo);
  while (day <= today) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const dataMap = new Map(data.map(d => [d.date, d]));

  const levelColorMap = [
    'bg-muted', // level 0
    'bg-primary/20', // level 1
    'bg-primary/50', // level 2
    'bg-primary/70', // level 3
    'bg-primary', // level 4
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
        <div className="grid grid-rows-7 gap-1 text-xs text-muted-foreground">
            <div className="h-3"></div>
            <div>Mon</div>
            <div className="h-3"></div>
            <div>Wed</div>
            <div className="h-3"></div>
            <div>Fri</div>
            <div className="h-3"></div>
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
          {days.map(d => {
            const dateString = d.toISOString().slice(0, 10);
            const activity = dataMap.get(dateString);
            const level = activity?.level ?? 0;
            const color = levelColorMap[level];
            
            return (
              <Tooltip key={dateString}>
                <TooltipTrigger asChild>
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activity?.count ?? 'No'} workouts on {d.toLocaleDateString()}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
