import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, Clock, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { getShifts, getTasks, Shift, Task } from '@/lib/storage';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

interface WorkSummary {
  totalHours: number;
  totalShifts: number;
  averageHoursPerShift: number;
  completedTasks: number;
  pendingTasks: number;
  overtimeHours: number;
}

const ReportsManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
  const [workSummary, setWorkSummary] = useState<WorkSummary>({
    totalHours: 0,
    totalShifts: 0,
    averageHoursPerShift: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overtimeHours: 0,
  });
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadData = useCallback(() => {
    const allShifts = getShifts();
    const allTasks = getTasks();
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case 'currentMonth': {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      }
      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      }
      case 'last3Months': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        endDate = endOfMonth(now);
        break;
      }
      case 'currentYear': {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      }
      default: {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }
    }

    const filteredShifts = allShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return isWithinInterval(shiftDate, { start: startDate, end: endDate });
    });

    const filteredTasks = allTasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return isWithinInterval(taskDate, { start: startDate, end: endDate });
    });

    setShifts(filteredShifts);
    setTasks(filteredTasks);

    // Calculate summary
    const totalHours = filteredShifts.reduce((sum, shift) => {
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = filteredTasks.filter(task => task.status !== 'completed').length;
    const overtimeHours = filteredShifts.reduce((sum, shift) => {
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + Math.max(0, hours - 8); // Assuming 8 hours is regular time
    }, 0);

    setWorkSummary({
      totalHours,
      totalShifts: filteredShifts.length,
      averageHoursPerShift: filteredShifts.length > 0 ? totalHours / filteredShifts.length : 0,
      completedTasks,
      pendingTasks,
      overtimeHours,
    });
  }, [selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const exportToPDF = () => {
    // Simulate PDF export
    const data = {
      period: selectedPeriod,
      summary: workSummary,
      shifts: shifts.length,
      tasks: tasks.length,
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-report-${selectedPeriod}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Start Time', 'End Time', 'Hours', 'Type'].join(','),
      ...shifts.map(shift => {
        const start = new Date(`${shift.date}T${shift.startTime}`);
        const end = new Date(`${shift.date}T${shift.endTime}`);
        const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2);
        return [shift.date, shift.startTime, shift.endTime, hours, shift.type || 'Regular'].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shifts-${selectedPeriod}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Reports</h2>
          <p className="text-gray-600">View and export your work data and statistics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currentMonth">Current Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="currentYear">Current Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            PDF
          </Button>
          
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workSummary.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Across {workSummary.totalShifts} shifts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Shift</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workSummary.averageHoursPerShift.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Per shift average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workSummary.overtimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Extra hours worked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shifts">Shift Details</TabsTrigger>
          <TabsTrigger value="tasks">Task Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Shift Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shifts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No shifts found for the selected period</p>
              ) : (
                <div className="space-y-2">
                  {shifts.map((shift, index) => {
                    const start = new Date(`${shift.date}T${shift.startTime}`);
                    const end = new Date(`${shift.date}T${shift.endTime}`);
                    const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{format(new Date(shift.date), 'MMM dd, yyyy')}</div>
                          <div className="text-sm text-gray-600">
                            {shift.startTime} - {shift.endTime}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{hours}h</div>
                          <Badge variant={shift.type === 'Overtime' ? 'destructive' : 'secondary'}>
                            {shift.type || 'Regular'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Task Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{workSummary.completedTasks}</div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{workSummary.pendingTasks}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
              </div>

              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tasks found for the selected period</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Badge
                          variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in-progress' ? 'secondary' : 'outline'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManagement;
