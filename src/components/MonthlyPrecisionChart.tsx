
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface ScheduleItem {
  day: string;
  date: number;
  hours: string;
  time: string;
}

interface MonthlyData {
  name: string;
  hours: number;
  overtime: number;
  efficiency: number;
}

interface MonthlyPrecisionChartProps {
  scheduleData?: ScheduleItem[];
  currentDate?: Date;
}

const MonthlyPrecisionChart = ({ scheduleData = [], currentDate = new Date() }: MonthlyPrecisionChartProps) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [summaryData, setSummaryData] = useState<any[]>([]);

  useEffect(() => {
    calculateMonthlyPrecision();
  }, [scheduleData, currentDate]);

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

  const calculateMonthlyPrecision = () => {
    const weekNames = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    const weeks: MonthlyData[] = weekNames.map(name => ({
      name,
      hours: 0,
      overtime: 0,
      efficiency: 0
    }));

    let totalHours = 0;
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;

    scheduleData.forEach(item => {
      const hours = parseTimeRange(item.time || item.hours);
      totalHours += hours;
      
      // Calculate which week this falls into (simplified)
      const weekIndex = Math.min(Math.floor((item.date - 1) / 7), 4);
      
      if (weekIndex >= 0 && weekIndex < weeks.length) {
        weeks[weekIndex].hours += hours;
        
        // Calculate overtime (assuming 8 hours is standard per day)
        const overtime = Math.max(0, hours - 8);
        weeks[weekIndex].overtime += overtime;
        totalOvertimeHours += overtime;
        totalRegularHours += Math.min(hours, 8);
      }
    });

    // Calculate efficiency (hours worked vs expected)
    weeks.forEach(week => {
      const expectedHours = 40; // 5 days * 8 hours
      week.efficiency = week.hours > 0 ? Math.round((week.hours / expectedHours) * 100) : 0;
    });

    setMonthlyData(weeks);

    // Summary data for pie chart
    const summary = [
      { name: 'Regular Hours', value: totalRegularHours, color: '#3B82F6' },
      { name: 'Overtime', value: totalOvertimeHours, color: '#EF4444' },
      { name: 'Remaining', value: Math.max(0, 160 - totalHours), color: '#E5E7EB' }
    ];

    setSummaryData(summary);
  };

  const COLORS = ['#3B82F6', '#EF4444', '#E5E7EB'];

  return (
    <div className="space-y-6">
      {/* Weekly Breakdown Bar Chart */}
      <div className="h-40">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Weekly Breakdown</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6B7280' }}
            />
            <YAxis hide />
            <Tooltip 
              formatter={(value, name) => [
                `${value}h`, 
                name === 'hours' ? 'Total Hours' : name === 'overtime' ? 'Overtime' : 'Efficiency %'
              ]}
            />
            <Bar dataKey="hours" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="overtime" fill="#EF4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Pie Chart */}
      <div className="h-32">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Summary</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={summaryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={50}
              paddingAngle={2}
            >
              {summaryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}h`, '']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Precision Metrics */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-blue-600 dark:text-blue-400 font-medium">Avg Daily</div>
          <div className="text-lg font-bold text-blue-800 dark:text-blue-300">
            {Math.round((summaryData[0]?.value + summaryData[1]?.value) / scheduleData.length * 10) / 10 || 0}h
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="text-red-600 dark:text-red-400 font-medium">Overtime Rate</div>
          <div className="text-lg font-bold text-red-800 dark:text-red-300">
            {Math.round((summaryData[1]?.value / (summaryData[0]?.value + summaryData[1]?.value)) * 100) || 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPrecisionChart;
