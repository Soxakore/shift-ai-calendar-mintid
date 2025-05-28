
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const WorkHoursStats = () => {
  const stats = [
    { label: 'Day', value: '9 h', trend: 'up' },
    { label: 'Week', value: '37 h', trend: 'stable' },
    { label: 'Month', value: '148 h', trend: 'up' },
  ];

  const overallStats = [
    { label: 'Urloard across', value: '32 h' },
    { label: 'Total Hours', value: '148 h' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Hours Worked
          <TrendingUp className="w-4 h-4 text-green-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-gray-600">{stat.label}</span>
            <span className="font-semibold text-lg">{stat.value}</span>
          </div>
        ))}
        
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
