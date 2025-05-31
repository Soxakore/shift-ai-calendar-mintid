
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScheduleItem {
  day: string;
  date: number;
  hours: string;
  time: string;
}

interface WorkHoursStatsProps {
  scheduleData?: ScheduleItem[];
  currentDate?: Date;
}

const WorkHoursStats = ({ scheduleData = [], currentDate = new Date() }: WorkHoursStatsProps) => {
  const [stats, setStats] = useState({
    day: 0,
    week: 0,
    month: 0,
    total: 0
  });

  useEffect(() => {
    calculateStats();
  }, [scheduleData, currentDate]);

  const calculateHoursFromTimeRange = (timeRange: string): number => {
    if (!timeRange || !timeRange.includes('-')) {
      // Fallback to parsing hours string if no time range
      const hoursMatch = timeRange.match(/(\d+\.?\d*)/);
      return hoursMatch ? parseFloat(hoursMatch[1]) : 0;
    }
    
    const [startTime, endTime] = timeRange.split('-');
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let start = startHour + (startMin || 0) / 60;
    let end = endHour + (endMin || 0) / 60;
    
    // Handle overnight shifts (e.g., 22:00-06:00)
    if (end < start) {
      end += 24;
    }
    
    return Math.round((end - start) * 10) / 10;
  };

  const calculateStats = () => {
    const today = new Date();
    const currentMonthYear = currentDate.getMonth() === today.getMonth() && 
                           currentDate.getFullYear() === today.getFullYear();

    let dayHours = 0;
    let weekHours = 0;
    let monthHours = 0;
    let totalHours = 0;

    scheduleData.forEach(item => {
      // Calculate hours from time range or fallback to hours string
      const hoursValue = calculateHoursFromTimeRange(item.time || item.hours);
      
      // Only calculate for current month/year if we're viewing current month
      if (currentMonthYear) {
        const itemDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), item.date);
        
        totalHours += hoursValue;
        monthHours += hoursValue;

        // Check if it's today
        if (item.date === today.getDate()) {
          dayHours += hoursValue;
        }

        // Check if it's in current week (simple week calculation)
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday

        if (itemDate >= weekStart && itemDate <= weekEnd) {
          weekHours += hoursValue;
        }
      } else {
        // For other months, just add to total and month
        totalHours += hoursValue;
        monthHours += hoursValue;
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
