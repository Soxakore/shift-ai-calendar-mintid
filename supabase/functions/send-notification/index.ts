import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface NotificationRequest {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  template?: 'schedule_reminder' | 'task_assigned' | 'shift_change' | 'custom';
  data?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const {
      type,
      recipient,
      subject,
      message,
      template,
      data
    }: NotificationRequest = await req.json();

    // Validate required fields
    if (!type || !recipient || !message) {
      throw new Error('Missing required fields: type, recipient, and message are required');
    }

    let finalMessage = message;
    let finalSubject = subject || 'MinTid Notification';

    // Apply template if specified
    if (template && data) {
      switch (template) {
        case 'schedule_reminder':
          finalSubject = `Schedule Reminder - ${data.shift_type || 'Shift'} on ${data.date || 'Tomorrow'}`;
          finalMessage = `
Hello ${data.employee_name || 'there'},

This is a reminder about your upcoming shift:

📅 Date: ${data.date || 'Tomorrow'}
⏰ Time: ${data.start_time || 'TBD'} - ${data.end_time || 'TBD'}
📍 Shift Type: ${data.shift_type || 'Regular'}

Please make sure to arrive on time and prepared for your shift.

Best regards,
MinTid Team
          `.trim();
          break;

        case 'task_assigned':
          finalSubject = `New Task Assigned: ${data.task_title || 'Task'}`;
          finalMessage = `
Hello ${data.employee_name || 'there'},

You have been assigned a new task:

📋 Task: ${data.task_title || 'New Task'}
📝 Description: ${data.task_description || 'No description provided'}
📅 Due Date: ${data.due_date || 'No due date set'}
👤 Assigned by: ${data.assigned_by || 'Manager'}

Please check your dashboard for more details.

Best regards,
MinTid Team
          `.trim();
          break;

        case 'shift_change':
          finalSubject = `Shift Change Notification`;
          finalMessage = `
Hello ${data.employee_name || 'there'},

There has been a change to your scheduled shift:

📅 Date: ${data.date || 'TBD'}
🔄 Change: ${data.change_type || 'Modified'}
⏰ New Time: ${data.new_start_time || 'TBD'} - ${data.new_end_time || 'TBD'}
📍 Location: ${data.location || 'Same as before'}

Please confirm receipt of this notification.

Best regards,
MinTid Team
          `.trim();
          break;
      }
    }

    // Process notification based on type
    let result;
    
    switch (type) {
      case 'email':
        result = await sendEmail(recipient, finalSubject, finalMessage);
        break;
      case 'sms':
        result = await sendSMS(recipient, finalMessage);
        break;
      case 'push':
        result = await sendPushNotification(recipient, finalSubject, finalMessage);
        break;
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${type.toUpperCase()} notification sent successfully`,
        result: result
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});

// Email sending function (you'd integrate with a service like SendGrid, Resend, etc.)
async function sendEmail(to: string, subject: string, message: string) {
  // For demonstration - in production you'd use a real email service
  console.log('📧 Sending Email:', { to, subject, message });
  
  // Example integration with a hypothetical email service:
  /*
  const emailResponse = await fetch('https://api.emailservice.com/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('EMAIL_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      subject,
      html: message.replace(/\n/g, '<br>'),
      from: 'noreply@mintid.com'
    })
  });
  
  return await emailResponse.json();
  */
  
  return { 
    status: 'simulated', 
    message: 'Email would be sent in production environment',
    to,
    subject 
  };
}

// SMS sending function (you'd integrate with Twilio, etc.)
async function sendSMS(to: string, message: string) {
  console.log('📱 Sending SMS:', { to, message });
  
  // Example Twilio integration:
  /*
  const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${Deno.env.get('TWILIO_ACCOUNT_SID')}:${Deno.env.get('TWILIO_AUTH_TOKEN')}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: to,
      From: Deno.env.get('TWILIO_PHONE_NUMBER') || '',
      Body: message
    })
  });
  
  return await twilioResponse.json();
  */
  
  return { 
    status: 'simulated', 
    message: 'SMS would be sent in production environment',
    to 
  };
}

// Push notification function
async function sendPushNotification(to: string, title: string, message: string) {
  console.log('🔔 Sending Push Notification:', { to, title, message });
  
  // Example Firebase Cloud Messaging integration:
  /*
  const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: to, // FCM token
      notification: {
        title,
        body: message,
        icon: '/favicon.ico'
      }
    })
  });
  
  return await fcmResponse.json();
  */
  
  return { 
    status: 'simulated', 
    message: 'Push notification would be sent in production environment',
    to,
    title 
  };
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-notification' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
