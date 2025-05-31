import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CalendarDays, User, Filter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface TimeStampHistoryProps {
  timeLogs: Tables<'time_logs'>[];
  employees: Tables<'profiles'>[];
}

interface TimeLog {
  id: string;
  user_id: string;
  clock_in?: string;
  clock_out?: string;
  date: string;
  total_hours?: number;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  display_name: string;
  username: string;
}

const TimeStampHistory: React.FC<TimeStampHistoryProps> = ({ timeLogs, employees }) => {
  const [filteredLogs, setFilteredLogs] = useState<TimeLog[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('week');
  const [loading, setLoading] = useState(false);

  const filterLogs = useCallback(() => {
    let filtered = [...timeLogs];

    // Filter by employee
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(log => log.user_id === selectedEmployee);
    }

    // Filter by date range
    const now = new Date();
    const startDate = new Date();
    
    switch (dateFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    filtered = filtered.filter(log => 
      new Date(log.created_at) >= startDate
    );

    // Sort by most recent first
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredLogs(filtered);
  }, [timeLogs, selectedEmployee, dateFilter]);

  const getEmployeeName = (userId: string) => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? employee.display_name : 'Unknown Employee';
  };

  const formatDuration = (clockIn?: string, clockOut?: string) => {
    if (!clockIn) return 'No clock-in';
    if (!clockOut) return 'Still working';
    
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const exportToCSV = () => {
    const csvData = filteredLogs.map(log => ({
      Employee: getEmployeeName(log.user_id),
      Date: new Date(log.date).toLocaleDateString(),
      'Clock In': log.clock_in ? new Date(log.clock_in).toLocaleTimeString() : 'N/A',
      'Clock Out': log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : 'N/A',
      Duration: formatDuration(log.clock_in, log.clock_out),
      'Total Hours': log.total_hours || 0
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `time-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    filterLogs();
  }, [filterLogs]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Stamp History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold">{filteredLogs.length}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">
                {filteredLogs.filter(log => log.clock_in && log.clock_out).length}
              </div>
              <div className="text-sm text-muted-foreground">Complete Shifts</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">
                {filteredLogs.filter(log => log.clock_in && !log.clock_out).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Shifts</div>
            </Card>
          </div>

          {/* Time Logs List */}
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{getEmployeeName(log.user_id)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium">In:</span>{' '}
                        {log.clock_in ? new Date(log.clock_in).toLocaleTimeString() : 'Not clocked in'}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Out:</span>{' '}
                        {log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : 'Active'}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      Duration: {formatDuration(log.clock_in, log.clock_out)}
                    </div>
                  </div>
                  
                  <Badge variant={log.clock_out ? 'default' : 'secondary'}>
                    {log.clock_out ? 'Complete' : 'Active'}
                  </Badge>
                </div>
              </Card>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">⏰</div>
                <p>No time logs found</p>
                <p className="text-sm">Adjust your filters to see more results</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeStampHistory;
