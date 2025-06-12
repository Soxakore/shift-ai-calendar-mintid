# 🚀 Netlify Functions Guide for Shift AI Calendar

## Overview
Leverage Netlify Functions to enhance your shift scheduling application with serverless capabilities that complement your existing Supabase backend.

## Current Architecture
- **Frontend**: React/TypeScript hosted on Netlify
- **Backend**: Supabase with Edge Functions
- **Domain**: minatid.se
- **Functions**: Netlify Functions for additional serverless capabilities

## 📋 Recommended Netlify Functions for Your Application

### 1. **Health Check Function**
Monitor application health and dependencies

### 2. **Email Validation Function**
Validate email addresses before registration

### 3. **Password Reset Helper**
Secure password reset token validation

### 4. **Schedule Export Function**
Export shift schedules to PDF/CSV formats

### 5. **Webhook Handler**
Handle external webhooks (payment, integrations)

### 6. **Analytics Processor**
Process and aggregate usage analytics

### 7. **Backup Function**
Create periodic data backups

### 8. **Notification Gateway**
Send notifications via multiple channels (SMS, Email, Push)

## 🛠️ Function Implementation Examples

### Health Check Function
```javascript
// netlify/functions/health-check.js
exports.handler = async (event, context) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      supabase: await checkSupabase(),
      netlify: 'ok'
    }
  };
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(health)
  };
};
```

### Email Validation Function
```javascript
// netlify/functions/validate-email.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const { email } = JSON.parse(event.body);
  
  // Email validation logic
  const isValid = await validateEmailDomain(email);
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email, 
      isValid, 
      suggestions: isValid ? [] : getEmailSuggestions(email) 
    })
  };
};
```

### Schedule Export Function
```javascript
// netlify/functions/export-schedule.js
const PDFDocument = require('pdfkit');

exports.handler = async (event, context) => {
  const { scheduleId, format } = JSON.parse(event.body);
  
  if (format === 'pdf') {
    const pdfBuffer = await generateSchedulePDF(scheduleId);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="schedule-${scheduleId}.pdf"`
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    };
  }
  
  // Handle CSV export
  const csvData = await generateScheduleCSV(scheduleId);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="schedule-${scheduleId}.csv"`
    },
    body: csvData
  };
};
```

## 🔧 Function Configuration

### Environment Variables
Add these to your Netlify site settings:
```
SUPABASE_URL=https://kyiwpwlxmysyuqjdxvyq.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Function Directory Structure
```
netlify/
  functions/
    health-check.js
    validate-email.js
    export-schedule.js
    webhook-handler.js
    analytics-processor.js
    backup-manager.js
    notification-gateway.js
    password-reset-helper.js
```

## 🚀 Deployment Configuration

Update your `netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
  VITE_SUPABASE_URL = "https://kyiwpwlxmysyuqjdxvyq.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your_anon_key"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔌 Integration with Your React App

### API Client Setup
```typescript
// src/lib/netlify-functions.ts
const API_BASE = '/.netlify/functions';

export const netlifyFunctions = {
  healthCheck: () => fetch(`${API_BASE}/health-check`),
  
  validateEmail: (email: string) => 
    fetch(`${API_BASE}/validate-email`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
    
  exportSchedule: (scheduleId: string, format: 'pdf' | 'csv') =>
    fetch(`${API_BASE}/export-schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduleId, format })
    })
};
```

### React Component Integration
```typescript
// src/components/ScheduleExport.tsx
import { netlifyFunctions } from '@/lib/netlify-functions';

const ScheduleExport = ({ scheduleId }: { scheduleId: string }) => {
  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const response = await netlifyFunctions.exportSchedule(scheduleId, format);
      const blob = await response.blob();
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-${scheduleId}.${format}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-x-2">
      <Button onClick={() => handleExport('pdf')}>
        Export PDF
      </Button>
      <Button onClick={() => handleExport('csv')}>
        Export CSV
      </Button>
    </div>
  );
};
```

## ⚡ Performance Benefits

### Automatic Optimizations
- **Global CDN**: Functions deployed to multiple regions
- **Cold Start Optimization**: Faster function initialization
- **Version Control**: Functions versioned with your site
- **Deploy Previews**: Test functions in branch deployments

### Monitoring & Debugging
- **Real-time Logs**: View function execution logs
- **Error Tracking**: Built-in error monitoring
- **Performance Metrics**: Function execution time and memory usage
- **A/B Testing**: Test different function versions

## 🔒 Security Best Practices

### Authentication
```javascript
// netlify/functions/protected-function.js
exports.handler = async (event, context) => {
  // Verify JWT token
  const token = event.headers.authorization?.replace('Bearer ', '');
  
  try {
    const user = await verifySupabaseToken(token);
    
    // Function logic here
    return {
      statusCode: 200,
      body: JSON.stringify({ user, data: 'protected content' })
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
};
```

### Rate Limiting
```javascript
// Simple rate limiting with Netlify Blobs
const rateLimitCheck = async (ip) => {
  const key = `rate_limit_${ip}`;
  const current = await netlifyBlobs.get(key) || 0;
  
  if (current > 100) { // 100 requests per hour
    throw new Error('Rate limit exceeded');
  }
  
  await netlifyBlobs.set(key, current + 1, { ttl: 3600 });
};
```

## 📊 Analytics Integration

### Function Analytics
```javascript
// netlify/functions/analytics-processor.js
exports.handler = async (event, context) => {
  const { event_type, user_id, properties } = JSON.parse(event.body);
  
  // Process analytics event
  await logToSupabase({
    event_type,
    user_id,
    properties,
    timestamp: new Date().toISOString(),
    source: 'netlify_function'
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

## 🔄 Background Functions

### Scheduled Tasks
```javascript
// netlify/functions/scheduled-backup.js
exports.handler = async (event, context) => {
  // Triggered by Netlify cron job
  console.log('Running scheduled backup...');
  
  const backup = await createDatabaseBackup();
  await uploadToCloudStorage(backup);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Backup completed',
      timestamp: new Date().toISOString()
    })
  };
};
```

## 🚀 Getting Started

### 1. Create Functions Directory
```bash
mkdir -p netlify/functions
```

### 2. Install Dependencies
```bash
npm install --save-dev @netlify/functions
npm install pdfkit nodemailer
```

### 3. Update netlify.toml
Add functions configuration

### 4. Deploy to Netlify
Functions deploy automatically with your site

### 5. Test Functions
```bash
netlify dev  # Local development
netlify functions:invoke health-check  # Test specific function
```

## 📚 Resources

- **Netlify Functions Docs**: https://docs.netlify.com/functions/overview/
- **Local Development**: https://docs.netlify.com/cli/get-started/
- **Function Examples**: https://functions.netlify.com/examples/
- **Background Functions**: https://docs.netlify.com/functions/background-functions/

## 🎯 Next Steps

1. **Choose Functions**: Select which functions would benefit your application
2. **Create Functions**: Implement the functions you need
3. **Test Locally**: Use `netlify dev` for local testing
4. **Deploy**: Functions deploy automatically with your site
5. **Monitor**: Use Netlify dashboard to monitor function performance

Your shift scheduling application at `minatid.se` can now leverage the full power of serverless functions for enhanced functionality and performance!
