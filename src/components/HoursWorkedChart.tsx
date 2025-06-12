
import React, { useState, useEffect, useCallback } from 'react';
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

  const parseTimeRange = (timeRange: string): number => {
    if (!timeRange) return 0;
    
    // Handle simple hour formats like "6 h" or "8"
    if (!timeRange.includes('-')) {
      const hoursMatch = timeRange.match(/(\d+\.?\d*)/);
      return hoursMatch ? parseFloat(hoursMatch[1]) : 0;
    }
    
    const [startTime, endTime] = timeRange.split('-');
    
    const parseTime = (time: string): number => {
      // Handle formats like "7", "07", "7:30", "07:30", "21:09"
      const cleanTime = time.trim();
      
      if (cleanTime.includes(':')) {
        const [hours, minutes] = cleanTime.split(':').map(Number);
        return hours + (minutes || 0) / 60;
      } else {
        // Single number format like "7" or "07"
        return parseInt(cleanTime) || 0;
      }
    };
    
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    // Handle overnight shifts
    if (end < start) {
      return (24 - start) + end;
    }
    
    return Math.round((end - start) * 100) / 100;
  };

  const calculateWeeklyData = useCallback(() => {
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
      const hoursValue = parseTimeRange(item.time || item.hours);
      
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

    // Round hours to 2 decimal places for precision
    const processedData = weekData.map(item => ({
      ...item,
      hours: Math.round(item.hours * 100) / 100
    }));

    setData(processedData);
  }, [scheduleData, currentDate]);

  useEffect(() => {
    calculateWeeklyData();
  }, [calculateWeeklyData]);

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
