
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Calendar, Users, Clock, TrendingUp, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReportsManagement = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Sample data for reports
  const weeklyHours = [
    { name: 'Mon', hours: 8, overtime: 0 },
    { name: 'Tue', hours: 8.5, overtime: 0.5 },
    { name: 'Wed', hours: 9, overtime: 1 },
    { name: 'Thu', hours: 8, overtime: 0 },
    { name: 'Fri', hours: 10, overtime: 2 },
    { name: 'Sat', hours: 6, overtime: 0 },
    { name: 'Sun', hours: 4, overtime: 0 }
  ];

  const departmentStats = [
    { name: 'Kitchen', value: 145, color: '#8884d8' },
    { name: 'Front Counter', value: 120, color: '#82ca9d' },
    { name: 'Management', value: 80, color: '#ffc658' },
    { name: 'Cleaning', value: 55, color: '#ff7300' }
  ];

  const employeePerformance = [
    { id: '1', name: 'Mary Cook', department: 'Kitchen', hoursWorked: 40, tasksCompleted: 12, attendance: '95%', performance: 'Excellent' },
    { id: '2', name: 'John Doe', department: 'Kitchen', hoursWorked: 38, tasksCompleted: 10, attendance: '90%', performance: 'Good' },
    { id: '3', name: 'Jane Smith', department: 'Front Counter', hoursWorked: 42, tasksCompleted: 15, attendance: '98%', performance: 'Excellent' },
    { id: '4', name: 'Bob Johnson', department: 'Cleaning', hoursWorked: 35, tasksCompleted: 8, attendance: '85%', performance: 'Average' }
  ];

  const monthlyTrends = [
    { month: 'Jan', totalHours: 1250, avgDaily: 40.3 },
    { month: 'Feb', totalHours: 1180, avgDaily: 42.1 },
    { month: 'Mar', totalHours: 1320, avgDaily: 42.6 },
    { month: 'Apr', totalHours: 1280, avgDaily: 42.7 },
    { month: 'May', totalHours: 1350, avgDaily: 43.5 }
  ];

  const handleExportReport = (type: string) => {
    toast({
      title: "📊 Report Generated",
      description: `${type} report has been exported successfully`,
    });
    
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob(['Sample report data...'], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `mintid-${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600">Track performance and generate insights</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
              <SelectItem value="counter">Front Counter</SelectItem>
              <SelectItem value="management">Management</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => handleExportReport('summary')} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <div className="text-2xl font-bold">324</div>
                <p className="text-xs text-green-600">+12% from last week</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-green-600">+2 this month</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-red-600">+5 from last week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-green-600">+3% improvement</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Hours Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" name="Regular Hours" />
                <Bar dataKey="overtime" fill="#ef4444" name="Overtime" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Hours by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalHours" stroke="#3b82f6" strokeWidth={2} name="Total Hours" />
              <Line type="monotone" dataKey="avgDaily" stroke="#10b981" strokeWidth={2} name="Avg Daily Hours" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Employee Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee Performance</CardTitle>
          <Button variant="outline" onClick={() => handleExportReport('employee-performance')}>
            <FileText className="w-4 h-4 mr-2" />
            Export Details
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Hours Worked</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeePerformance.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.hoursWorked}h</TableCell>
                  <TableCell>{employee.tasksCompleted}</TableCell>
                  <TableCell>{employee.attendance}</TableCell>
                  <TableCell>
                    <Badge className={getPerformanceColor(employee.performance)}>
                      {employee.performance}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => handleExportReport('weekly-summary')} className="h-auto flex-col p-4">
              <FileText className="w-6 h-6 mb-2" />
              <span>Weekly Summary</span>
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('payroll')} className="h-auto flex-col p-4">
              <FileText className="w-6 h-6 mb-2" />
              <span>Payroll Report</span>
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('attendance')} className="h-auto flex-col p-4">
              <FileText className="w-6 h-6 mb-2" />
              <span>Attendance Log</span>
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('performance')} className="h-auto flex-col p-4">
              <FileText className="w-6 h-6 mb-2" />
              <span>Performance Review</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsManagement;
