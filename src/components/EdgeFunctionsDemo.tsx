import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Calendar, FileText, Bell, Clock, Users, TrendingUp } from 'lucide-react';

const EdgeFunctionsDemo = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const callEdgeFunction = async (functionName: string, payload: any) => {
    setLoading(functionName);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      toast({
        title: "Error",
        description: `Failed to call ${functionName}: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(null);
    }
  };

  const sendScheduleReminder = async () => {
    const result = await callEdgeFunction('schedule-reminder', {
      days_ahead: 1
    });
    
    if (result) {
      toast({
        title: "Schedule Reminders Sent",
        description: `${result.message}. Processed ${result.reminders?.length || 0} reminders.`,
      });
    }
  };

  const generateWeeklyReport = async () => {
    const result = await callEdgeFunction('generate-report', {
      report_type: 'weekly'
    });
    
    if (result) {
      setReportData(result.report);
      toast({
        title: "Report Generated",
        description: "Weekly report has been generated successfully.",
      });
    }
  };

  const sendTestNotification = async () => {
    const result = await callEdgeFunction('send-notification', {
      type: 'email',
      recipient: 'test@example.com',
      template: 'schedule_reminder',
      data: {
        employee_name: 'John Doe',
        date: 'Tomorrow',
        start_time: '09:00',
        end_time: '17:00',
        shift_type: 'Regular'
      }
    });
    
    if (result) {
      toast({
        title: "Notification Sent",
        description: "Test notification has been sent successfully.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Badge variant="secondary">⚡ Edge Functions</Badge>
        <h2 className="text-2xl font-bold">Serverless Functions Demo</h2>
      </div>

      <Tabs defaultValue="functions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="functions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Schedule Reminder Function */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Schedule Reminders</span>
                </CardTitle>
                <CardDescription>
                  Send reminders to employees about upcoming shifts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• Queries upcoming schedules</p>
                  <p>• Sends personalized reminders</p>
                  <p>• Configurable time ahead</p>
                </div>
                <Button 
                  onClick={sendScheduleReminder}
                  disabled={loading === 'schedule-reminder'}
                  className="w-full"
                >
                  {loading === 'schedule-reminder' ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Send Reminders
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Report Generator Function */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Report Generator</span>
                </CardTitle>
                <CardDescription>
                  Generate comprehensive work hour reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• Weekly/monthly reports</p>
                  <p>• Employee breakdowns</p>
                  <p>• Automatic calculations</p>
                </div>
                <Button 
                  onClick={generateWeeklyReport}
                  disabled={loading === 'generate-report'}
                  className="w-full"
                >
                  {loading === 'generate-report' ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Function */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Send email, SMS, and push notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• Multiple notification types</p>
                  <p>• Template system</p>
                  <p>• Personalization support</p>
                </div>
                <Button 
                  onClick={sendTestNotification}
                  disabled={loading === 'send-notification'}
                  className="w-full"
                >
                  {loading === 'send-notification' ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reportData ? (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Report Results</CardTitle>
                <CardDescription>
                  Generated on {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {reportData.summary.total_employees}
                    </div>
                    <div className="text-sm text-blue-600">Total Employees</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {reportData.summary.total_hours_worked}h
                    </div>
                    <div className="text-sm text-green-600">Total Hours</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {reportData.summary.total_work_sessions}
                    </div>
                    <div className="text-sm text-purple-600">Work Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {reportData.summary.average_hours_per_day}h
                    </div>
                    <div className="text-sm text-orange-600">Avg Hours/Day</div>
                  </div>
                </div>

                {reportData.employee_breakdown.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Top Performers</h4>
                    <div className="space-y-2">
                      {reportData.employee_breakdown.slice(0, 5).map((employee: any, index: number) => (
                        <div key={employee.employee_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{employee.employee_name}</span>
                          <Badge variant="secondary">{employee.total_hours}h</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Generate a report to see results here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Examples</CardTitle>
              <CardDescription>
                How to integrate these functions into your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">React Hook Usage</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const { generateReport } = useEdgeFunctions();

const handleReport = async () => {
  const { data } = await generateReport('weekly');
  console.log(data.report);
};`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Scheduled Automation</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`-- Daily reminders at 6 PM
SELECT cron.schedule(
  'daily-reminders',
  '0 18 * * *',
  $$ SELECT net.http_post(...) $$
);`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Webhook Integration</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Trigger on schedule changes
supabase
  .channel('schedule_changes')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'schedules' },
    (payload) => {
      // Auto-send reminder
      sendNotification(payload.new);
    }
  )`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EdgeFunctionsDemo;
