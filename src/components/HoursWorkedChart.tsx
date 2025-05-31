
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

interface ScheduleItem {
  day: string;
  date: number;
  hours: string;
  time: string;
}

interface ChartData {
  day: string;
  hours: number;
}

interface HoursWorkedChartProps {
  scheduleData?: ScheduleItem[];
  currentDate?: Date;
}

const HoursWorkedChart = ({ scheduleData = [], currentDate = new Date() }: HoursWorkedChartProps) => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    calculateWeeklyData();
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

  const calculateWeeklyData = () => {
    const today = new Date();
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Initialize week data with 0 hours
    const weekData: ChartData[] = weekDays.map(day => ({
      day,
      hours: 0
    }));

    // Calculate current week dates
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday

    scheduleData.forEach(item => {
      // Calculate hours from time range or fallback to hours string
      const hoursValue = calculateHoursFromTimeRange(item.time || item.hours);
      
      // Create date for this schedule item
      const itemDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), item.date);
      
      // Check if this item falls within the current week
      const dayOfWeek = itemDate.getDay();
      const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6 in Monday-first week
      
      // Check if item is in current week
      const weekStart = new Date(currentWeekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (itemDate >= weekStart && itemDate <= weekEnd) {
        if (weekData[mondayBasedDay]) {
          weekData[mondayBasedDay].hours += hoursValue;
        }
      }
    });

    // Round hours to 1 decimal place
    const processedData = weekData.map(item => ({
      ...item,
      hours: Math.round(item.hours * 10) / 10
    }));

    setData(processedData);
  };

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Bar 
            dataKey="hours" 
            fill="#3B82F6"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HoursWorkedChart;
