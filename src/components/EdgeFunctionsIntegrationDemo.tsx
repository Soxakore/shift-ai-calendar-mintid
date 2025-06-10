import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface EdgeFunctionResult {
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: any;
  error?: string;
}

export function EdgeFunctionsIntegrationDemo() {
  const [functions, setFunctions] = useState<EdgeFunctionResult[]>([
    { name: 'schedule-reminder', status: 'idle' },
    { name: 'generate-report', status: 'idle' },
    { name: 'send-notification', status: 'idle' },
    { name: 'presence-notifications', status: 'idle' }
  ]);

  const updateFunctionStatus = (name: string, updates: Partial<EdgeFunctionResult>) => {
    setFunctions(prev => prev.map(fn => 
      fn.name === name ? { ...fn, ...updates } : fn
    ));
  };

  const testScheduleReminder = async () => {
    updateFunctionStatus('schedule-reminder', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('schedule-reminder', {
        body: { days_ahead: 1 }
      });

      if (error) throw error;

      updateFunctionStatus('schedule-reminder', { 
        status: 'success', 
        result: data 
      });
    } catch (error) {
      updateFunctionStatus('schedule-reminder', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const testGenerateReport = async () => {
    updateFunctionStatus('generate-report', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { 
          report_type: 'weekly'
        }
      });

      if (error) throw error;

      updateFunctionStatus('generate-report', { 
        status: 'success', 
        result: data 
      });
    } catch (error) {
      updateFunctionStatus('generate-report', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const testSendNotification = async () => {
    updateFunctionStatus('send-notification', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'email',
          recipient: 'demo@example.com',
          message: 'This is a test notification from MinTid',
          template: 'schedule_reminder',
          data: {
            employee_name: 'Demo User',
            date: new Date().toLocaleDateString(),
            start_time: '09:00',
            end_time: '17:00',
            shift_type: 'Demo Shift'
          }
        }
      });

      if (error) throw error;

      updateFunctionStatus('send-notification', { 
        status: 'success', 
        result: data 
      });
    } catch (error) {
      updateFunctionStatus('send-notification', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const testPresenceNotifications = async () => {
    updateFunctionStatus('presence-notifications', { status: 'loading' });
    
    try {
      const { data, error } = await supabase.functions.invoke('presence-notifications', {
        body: {
          type: 'team_alert',
          message: 'Demo team alert: All hands meeting in 5 minutes',
          priority: 'medium',
          sender_id: 'demo-user-id',
          channels: ['employee_workspace']
        }
      });

      if (error) throw error;

      updateFunctionStatus('presence-notifications', { 
        status: 'success', 
        result: data 
      });
    } catch (error) {
      updateFunctionStatus('presence-notifications', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const testAllFunctions = async () => {
    await Promise.all([
      testScheduleReminder(),
      testGenerateReport(),
      testSendNotification(),
      testPresenceNotifications()
    ]);
  };

  const getStatusIcon = (status: EdgeFunctionResult['status']) => {
    switch (status) {
      case 'idle': return '⚪';
      case 'loading': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: EdgeFunctionResult['status']) => {
    switch (status) {
      case 'idle': return 'text-gray-500';
      case 'loading': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Edge Functions Integration Demo
        </h1>
        <p className="text-gray-600 mb-4">
          Test all deployed Supabase Edge Functions for MinTid Smart Work Schedule Calendar
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">🔗 Deployed Functions:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>• <code>schedule-reminder</code> - Shift reminders</div>
            <div>• <code>generate-report</code> - Analytics & reporting</div>
            <div>• <code>send-notification</code> - Multi-channel notifications</div>
            <div>• <code>presence-notifications</code> - Smart presence alerts</div>
          </div>
        </div>

        <button
          onClick={testAllFunctions}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-6"
        >
          🧪 Test All Functions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {functions.map((fn) => (
          <div key={fn.name} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                <span className="mr-2">{getStatusIcon(fn.status)}</span>
                {fn.name}
              </h3>
              <span className={`text-sm font-medium ${getStatusColor(fn.status)}`}>
                {fn.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              {fn.name === 'schedule-reminder' && (
                <button
                  onClick={testScheduleReminder}
                  disabled={fn.status === 'loading'}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  📅 Test Schedule Reminder
                </button>
              )}

              {fn.name === 'generate-report' && (
                <button
                  onClick={testGenerateReport}
                  disabled={fn.status === 'loading'}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  📊 Test Report Generation
                </button>
              )}

              {fn.name === 'send-notification' && (
                <button
                  onClick={testSendNotification}
                  disabled={fn.status === 'loading'}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  📧 Test Send Notification
                </button>
              )}

              {fn.name === 'presence-notifications' && (
                <button
                  onClick={testPresenceNotifications}
                  disabled={fn.status === 'loading'}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  👥 Test Presence Notifications
                </button>
              )}
            </div>

            {fn.result && (
              <div className="mt-4">
                <h4 className="font-medium text-green-700 mb-2">✅ Success Result:</h4>
                <pre className="bg-green-50 p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(fn.result, null, 2)}
                </pre>
              </div>
            )}

            {fn.error && (
              <div className="mt-4">
                <h4 className="font-medium text-red-700 mb-2">❌ Error:</h4>
                <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                  {fn.error}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Function Details:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div><strong>schedule-reminder:</strong> Automated shift reminders</div>
            <div><strong>generate-report:</strong> Work hour analytics</div>
          </div>
          <div className="space-y-2">
            <div><strong>send-notification:</strong> Email/SMS/Push notifications</div>
            <div><strong>presence-notifications:</strong> Real-time team alerts</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Some functions may show errors due to missing database tables. 
            See <code>DEPLOYMENT_COMPLETE.md</code> for database setup instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
