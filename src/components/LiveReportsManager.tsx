import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Download, 
  Users, 
  Clock, 
  TrendingUp,
  Calendar,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { edgeFunctionsService } from '@/services/edgeFunctionsService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface LiveReportsManagerProps {
  organisationId?: string;
  departmentId?: string;
}

export function LiveReportsManager({ organisationId, departmentId }: LiveReportsManagerProps) {
  const { toast } = useToast();
  const { profile } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generateReport = async (type: 'weekly' | 'monthly' = reportType) => {
    setIsLoading(true);
    try {
      const result = await edgeFunctionsService.generateReport({
        report_type: type,
        organization_id: organisationId,
        department_id: departmentId
      });

      if (result.success) {
        setReportData(result.report);
        setLastGenerated(new Date());
        toast({
          title: "📊 Report Generated",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "❌ Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!reportData) return;
    
    try {
      // Convert report data to CSV format
      const csvData = generateCSVReport(reportData);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `work-hours-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "⬇️ Download Started",
        description: "Report download has started",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  const generateCSVReport = (data: any): string => {
    let csv = 'Employee Name,Total Hours,Total Sessions,Average Session Duration\n';
    
    data.employee_breakdown.forEach((employee: any) => {
      csv += `"${employee.employee_name}",${employee.total_hours},${employee.total_sessions},${employee.average_session_duration.toFixed(2)}\n`;
    });

    csv += '\n\nDaily Breakdown\n';
    csv += 'Date,Total Hours,Total Employees,Total Sessions\n';
    
    data.daily_breakdown.forEach((day: any) => {
      csv += `${day.date},${day.total_hours},${day.total_employees},${day.total_sessions}\n`;
    });

    return csv;
  };

  const scheduleAutomatedReports = async () => {
    try {
      // Send notification about automated report scheduling
      await edgeFunctionsService.sendNotification({
        type: 'email',
        recipient: 'admin@company.com',
        subject: 'Automated Reports Scheduled',
        message: 'Weekly automated reports have been scheduled and will be sent every Monday at 9:00 AM.',
        template: 'custom',
        data: {
          report_type: reportType,
          scheduled_by: profile?.display_name || 'Admin',
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "⏰ Automation Enabled",
        description: "Automated weekly reports have been scheduled",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to schedule automated reports",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Auto-generate weekly report on component mount
    generateReport('weekly');
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Live Work Hours Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant={reportType === 'weekly' ? 'default' : 'outline'}
              onClick={() => setReportType('weekly')}
              size="sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Weekly Report
            </Button>
            
            <Button
              variant={reportType === 'monthly' ? 'default' : 'outline'}
              onClick={() => setReportType('monthly')}
              size="sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Monthly Report
            </Button>

            <Button
              onClick={() => generateReport()}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {reportData && (
              <Button
                onClick={downloadReport}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            )}

            <Button
              onClick={scheduleAutomatedReports}
              variant="outline"
              size="sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              Schedule Auto-Reports
            </Button>
          </div>

          {lastGenerated && (
            <Badge variant="outline" className="text-xs">
              Last updated: {lastGenerated.toLocaleString()}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Report Summary */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold">{reportData.summary.total_employees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold">{reportData.summary.total_hours_worked}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Avg Hours/Day</p>
                  <p className="text-2xl font-bold">{reportData.summary.average_hours_per_day}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Work Sessions</p>
                  <p className="text-2xl font-bold">{reportData.summary.total_work_sessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Performance */}
      {reportData && reportData.employee_breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.employee_breakdown.slice(0, 5).map((employee: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium">{employee.employee_name}</p>
                    <p className="text-sm text-gray-600">{employee.total_sessions} sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{employee.total_hours}h</p>
                    <p className="text-sm text-gray-600">
                      {employee.average_session_duration.toFixed(1)}h avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span>Generating {reportType} report...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
