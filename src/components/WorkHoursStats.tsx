
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getShifts } from '@/lib/storage';
import { startOfDay, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';

const WorkHoursStats = () => {
  const [stats, setStats] = useState({
    day: 0,
    week: 0,
    month: 0,
    total: 0
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const shifts = getShifts();
    const now = new Date();
    
    const dayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const monthStart = startOfMonth(now);

    let dayHours = 0;
    let weekHours = 0;
    let monthHours = 0;
    let totalHours = 0;

    shifts.forEach(shift => {
      const shiftDate = new Date(shift.date);
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      
      // Handle overnight shifts
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }
      
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += hours;

      // Check if shift is within current day
      if (isWithinInterval(shiftDate, { start: dayStart, end: now })) {
        dayHours += hours;
      }

      // Check if shift is within current week
      if (isWithinInterval(shiftDate, { start: weekStart, end: now })) {
        weekHours += hours;
      }

      // Check if shift is within current month
      if (isWithinInterval(shiftDate, { start: monthStart, end: now })) {
        monthHours += hours;
      }
    });

    setStats({
      day: Math.round(dayHours * 10) / 10,
      week: Math.round(weekHours * 10) / 10,
      month: Math.round(monthHours * 10) / 10,
      total: Math.round(totalHours * 10) / 10
    });
  };

  const getTrendIcon = (current: number, expected: number) => {
    if (current > expected) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < expected) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const overallStats = [
    { label: 'Overtime', value: `${Math.max(0, Math.round((stats.week - 40) * 10) / 10)} h` },
    { label: 'Total Hours', value: `${stats.total} h` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Hours Worked
          {getTrendIcon(stats.week, 40)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Day</span>
          <span className="font-semibold text-lg">{stats.day} h</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Week</span>
          <span className="font-semibold text-lg">{stats.week} h</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Month</span>
          <span className="font-semibold text-lg">{stats.month} h</span>
        </div>
        
        <hr className="my-4" />
        
        {overallStats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">{stat.label}</span>
            <span className="font-medium">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WorkHoursStats;
