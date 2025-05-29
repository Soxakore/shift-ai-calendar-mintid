
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { getShifts } from '@/lib/storage';
import { startOfWeek, eachDayOfInterval, endOfWeek, format, isSameDay } from 'date-fns';

interface ChartData {
  day: string;
  hours: number;
}

const HoursWorkedChart = () => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    calculateWeeklyData();
  }, []);

  const calculateWeeklyData = () => {
    const shifts = getShifts();
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const weekData = weekDays.map(day => {
      const dayShifts = shifts.filter(shift => {
        const shiftDate = new Date(shift.date);
        return isSameDay(shiftDate, day);
      });

      const totalHours = dayShifts.reduce((sum, shift) => {
        const start = new Date(`${shift.date}T${shift.startTime}`);
        const end = new Date(`${shift.date}T${shift.endTime}`);
        
        // Handle overnight shifts
        if (end < start) {
          end.setDate(end.getDate() + 1);
        }
        
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);

      return {
        day: format(day, 'EEE'), // Mon, Tue, etc.
        hours: Math.round(totalHours * 10) / 10
      };
    });

    setData(weekData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
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
      </CardContent>
    </Card>
  );
};

export default HoursWorkedChart;
