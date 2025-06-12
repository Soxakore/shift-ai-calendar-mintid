# 🚀 MinTid Edge Functions Guide

## What You Can Build with Supabase Edge Functions

Supabase Edge Functions are serverless TypeScript/JavaScript functions that run on the edge, close to your users. Here's what you can build for your MinTid application:

## 🔧 Functions We've Created

### 1. **Schedule Reminder Function** (`schedule-reminder`)
**Purpose:** Automatically send reminders to employees about upcoming shifts

**Features:**
- Query upcoming schedules from the database
- Send reminders 1 day (or configurable) ahead
- Support for individual or bulk reminders
- Integration ready for email/SMS services

**Example Usage:**
```bash
curl -L -X POST 'https://vcjmwgbjbllkkivrkvq.supabase.co/functions/v1/schedule-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  --data '{"days_ahead": 1, "employee_id": "optional"}'
```

### 2. **Report Generator Function** (`generate-report`)
**Purpose:** Generate comprehensive work hour and performance reports

**Features:**
- Weekly, monthly, or custom date range reports
- Employee breakdown with total hours and averages
- Daily statistics and trends
- Department/organisation filtering
- Automatic calculations and data aggregation

**Example Usage:**
```bash
curl -L -X POST 'https://vcjmwgbjbllkkivrkvq.supabase.co/functions/v1/generate-report' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  --data '{"report_type": "monthly", "department_id": "optional"}'
```

### 3. **Notification Function** (`send-notification`)
**Purpose:** Send various types of notifications with templates

**Features:**
- Email, SMS, and push notification support
- Pre-built templates for common scenarios
- Custom message and subject support
- Template variables for personalization

**Example Usage:**
```bash
curl -L -X POST 'https://vcjmwgbjbllkkivrkvq.supabase.co/functions/v1/send-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  --data '{
    "type": "email",
    "recipient": "employee@company.com",
    "template": "schedule_reminder",
    "data": {
      "employee_name": "John Doe",
      "date": "2025-06-11",
      "start_time": "09:00",
      "end_time": "17:00",
      "shift_type": "Regular"
    }
  }'
```

## 🌟 Additional Ideas You Can Build

### 📊 **Analytics & Reporting**
```typescript
// Weekly performance analytics
// Overtime calculation and alerts
// Attendance tracking and trends
// Department productivity metrics
```

### 🔄 **Automation & Workflows**
```typescript
// Auto-approve time-off requests based on rules
// Automatic shift scheduling based on availability
// Task auto-assignment based on workload
// Integration with payroll systems
```

### 🔔 **Smart Notifications**
```typescript
// Late arrival alerts
// Overtime warnings
// Schedule conflict detection
// Birthday/anniversary reminders
```

### 🔗 **Third-Party Integrations**
```typescript
// Calendar sync (Google Calendar, Outlook)
// Slack/Teams integration for notifications
// Payment processing for timesheets
// HR system synchronization
```

### 📱 **Mobile & PWA Features**
```typescript
// Push notifications for schedule changes
// Geofenced clock-in/out verification
// Offline data synchronization
// Camera integration for task documentation
```

### 🛡️ **Security & Compliance**
```typescript
// Audit trail generation
// Data backup and export
// GDPR compliance tools
// Security breach notifications
```

## 🚀 Deployment Instructions

1. **Make sure Supabase CLI is installed:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Deploy all functions:**
   ```bash
   ./deploy-functions.sh
   ```

4. **Or deploy individual functions:**
   ```bash
   supabase functions deploy schedule-reminder --project-ref vcjmwgbjbllkkivrkvq
   supabase functions deploy generate-report --project-ref vcjmwgbjbllkkivrkvq
   supabase functions deploy send-notification --project-ref vcjmwgbjbllkkivrkvq
   ```

## 🔧 Integration with Your Frontend

### React Hook Example:
```typescript
// hooks/useEdgeFunctions.ts
import { supabase } from '@/integrations/supabase/client';

export const useEdgeFunctions = () => {
  const sendScheduleReminder = async (employeeId?: string, daysAhead = 1) => {
    const { data, error } = await supabase.functions.invoke('schedule-reminder', {
      body: { employee_id: employeeId, days_ahead: daysAhead }
    });
    return { data, error };
  };

  const generateReport = async (reportType: 'weekly' | 'monthly', filters?: any) => {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { report_type: reportType, ...filters }
    });
    return { data, error };
  };

  const sendNotification = async (notificationData: any) => {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: notificationData
    });
    return { data, error };
  };

  return { sendScheduleReminder, generateReport, sendNotification };
};
```

### Component Usage:
```typescript
// components/admin/ReportGenerator.tsx
import { useEdgeFunctions } from '@/hooks/useEdgeFunctions';

export const ReportGenerator = () => {
  const { generateReport } = useEdgeFunctions();
  
  const handleGenerateReport = async () => {
    const { data, error } = await generateReport('monthly');
    if (data) {
      console.log('Report generated:', data.report);
      // Display report data
    }
  };

  return (
    <button onClick={handleGenerateReport}>
      Generate Monthly Report
    </button>
  );
};
```

## 🔄 Scheduled Functions (Cron Jobs)

You can set up scheduled functions using Supabase's pg_cron extension:

```sql
-- Run schedule reminders daily at 6 PM
SELECT cron.schedule(
  'daily-schedule-reminders',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vcjmwgbjbllkkivrkvq.supabase.co/functions/v1/schedule-reminder',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}',
    body := '{"days_ahead": 1}'
  ) as request_id;
  $$
);
```

## 💡 Pro Tips

1. **Use Service Role Key** for scheduled functions (cron jobs)
2. **Implement proper error handling** and logging
3. **Add rate limiting** for functions that send notifications
4. **Cache expensive computations** using Redis or similar
5. **Use environment variables** for API keys and configuration
6. **Test functions locally** using `supabase functions serve`

## 🧪 Testing Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test function
curl -L -X POST 'http://localhost:54321/functions/v1/schedule-reminder' \
  -H 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  --data '{"days_ahead": 1}'
```

This powerful combination of Edge Functions gives your MinTid application advanced backend capabilities while keeping everything serverless and scalable! 🚀
