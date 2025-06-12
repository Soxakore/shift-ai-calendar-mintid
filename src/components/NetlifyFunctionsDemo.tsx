import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, CheckCircle, XCircle, Loader2, Activity, Mail, FileText, Webhook } from 'lucide-react';
import { 
  useHealthCheck, 
  useEmailValidation, 
  useScheduleExport, 
  netlifyAPI,
  type HealthCheckResponse,
  type EmailValidationResponse 
} from '@/lib/netlify-functions';

export const NetlifyFunctionsDemo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailResult, setEmailResult] = useState<EmailValidationResponse | null>(null);
  const [scheduleId, setScheduleId] = useState('schedule-001');
  const [webhookTest, setWebhookTest] = useState<any>(null);

  // Use our custom hooks
  const { health, loading: healthLoading, error: healthError } = useHealthCheck();
  const { validateEmail, isValidating } = useEmailValidation();
  const { exportSchedule, isExporting } = useScheduleExport();

  const handleEmailValidation = async () => {
    if (!email) return;
    
    try {
      const result = await validateEmail(email);
      setEmailResult(result);
    } catch (error) {
      console.error('Email validation failed:', error);
    }
  };

  const handleScheduleExport = async (format: 'csv' | 'html' | 'json') => {
    try {
      await exportSchedule(scheduleId, format, {
        filename: `minatid-schedule-${scheduleId}.${format}`
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleWebhookTest = async () => {
    try {
      const result = await netlifyAPI.sendWebhook('test', {
        event_type: 'test.webhook',
        message: 'Testing webhook from minatid.se',
        timestamp: new Date().toISOString()
      });
      setWebhookTest(result);
    } catch (error) {
      console.error('Webhook test failed:', error);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Netlify Functions Demo</h1>
        <p className="text-gray-600 mt-2">
          Serverless functions powering minatid.se
        </p>
      </div>

      {/* Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Check
          </CardTitle>
          <CardDescription>
            Real-time system status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking system health...</span>
            </div>
          ) : healthError ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{healthError}</AlertDescription>
            </Alert>
          ) : health ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">System Status: {health.status}</span>
                <Badge variant="outline">{health.environment}</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Supabase</div>
                  <Badge variant={health.services.supabase === 'healthy' ? 'default' : 'destructive'}>
                    {health.services.supabase}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Netlify</div>
                  <Badge variant="default">{health.services.netlify}</Badge>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Response Time</div>
                  <div className="font-mono text-sm">{health.performance.responseTime}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Domain</div>
                  <div className="font-mono text-sm">{health.domain}</div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Email Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Validation
          </CardTitle>
          <CardDescription>
            Validate email addresses with smart suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleEmailValidation}
              disabled={!email || isValidating}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Validate'
              )}
            </Button>
          </div>

          {emailResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {emailResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {emailResult.isValid ? 'Valid Email' : 'Invalid Email'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Domain</div>
                  <div className="font-mono">{emailResult.domain}</div>
                </div>
                <div>
                  <div className="text-gray-500">Type</div>
                  <Badge variant="outline">
                    {emailResult.isBusinessEmail ? 'Business' : 'Personal'}
                  </Badge>
                </div>
                <div>
                  <div className="text-gray-500">Common Domain</div>
                  <Badge variant={emailResult.isCommonDomain ? 'default' : 'outline'}>
                    {emailResult.isCommonDomain ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {emailResult.suggestions.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <strong>Suggestions:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {emailResult.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Schedule Export
          </CardTitle>
          <CardDescription>
            Export shift schedules in multiple formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Schedule ID"
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleScheduleExport('csv')}
              disabled={!scheduleId || isExporting}
              variant="outline"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>

            <Button
              onClick={() => handleScheduleExport('html')}
              disabled={!scheduleId || isExporting}
              variant="outline"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export HTML
            </Button>

            <Button
              onClick={() => handleScheduleExport('json')}
              disabled={!scheduleId || isExporting}
              variant="outline"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Get JSON
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Note:</strong> This demo uses sample data. In production, 
              the function would fetch real schedule data from your Supabase database.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Webhook Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Handler
          </CardTitle>
          <CardDescription>
            Test webhook processing for external integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleWebhookTest} variant="outline">
            <Webhook className="h-4 w-4 mr-2" />
            Test Webhook
          </Button>

          {webhookTest && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">Webhook Response:</div>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(webhookTest, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Function URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Available Function Endpoints</CardTitle>
          <CardDescription>
            Direct access to your serverless functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div>GET /.netlify/functions/health-check</div>
            <div>POST /.netlify/functions/validate-email</div>
            <div>POST /.netlify/functions/export-schedule</div>
            <div>POST /.netlify/functions/webhook-handler</div>
          </div>
          
          <Alert className="mt-4">
            <AlertDescription>
              Functions are automatically deployed with your site at{' '}
              <strong>minatid.se</strong> and available via the <code>/api/*</code> path.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetlifyFunctionsDemo;
