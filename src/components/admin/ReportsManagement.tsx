
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Clock, Users } from 'lucide-react';

const ReportsManagement = () => {
  const [reportType, setReportType] = useState('hours');
  const [dateRange, setDateRange] = useState('2024-05');

  const hoursData = [
    { name: 'John Smith', hours: 160, overtime: 20 },
    { name: 'Jane Doe', hours: 140, overtime: 5 },
    { name: 'Michael Brown', hours: 120, overtime: 0 },
  ];

  const workloadData = [
    { time: '06:00', count: 2 },
    { time: '08:00', count: 5 },
    { time: '10:00', count: 8 },
    { time: '12:00', count: 10 },
    { time: '14:00', count: 9 },
    { time: '16:00', count: 7 },
    { time: '18:00', count: 4 },
    { time: '20:00', count: 3 },
    { time: '22:00', count: 2 },
  ];

  const departmentData = [
    { name: 'Office', value: 40, color: '#3B82F6' },
    { name: 'Night Shift', value: 30, color: '#10B981' },
    { name: 'Morning', value: 20, color: '#F59E0B' },
    { name: 'Weekend', value: 10, color: '#EF4444' },
  ];

  const totalHours = hoursData.reduce((sum, user) => sum + user.hours, 0);
  const totalOvertime = hoursData.reduce((sum, user) => sum + user.overtime, 0);
  const activeUsers = hoursData.length;

  const exportReport = (format: 'pdf' | 'csv') => {
    console.log(`Exporting ${reportType} report as ${format}`);
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overtime</p>
                <p className="text-2xl font-bold">{totalOvertime}h</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Hours/User</p>
                <p className="text-2xl font-bold">{Math.round(totalHours / activeUsers)}h</p>
              </div>
              <BarChart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Work Reports</CardTitle>
          <div className="flex gap-2">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Hours Report</SelectItem>
                <SelectItem value="workload">Workload Analysis</SelectItem>
                <SelectItem value="departments">Department Distribution</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="month"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-48"
            />
            <Button onClick={() => exportReport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reportType === 'hours' && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3B82F6" name="Regular Hours" />
                  <Bar dataKey="overtime" fill="#EF4444" name="Overtime Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {reportType === 'workload' && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" name="Active Workers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {reportType === 'departments' && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsManagement;
