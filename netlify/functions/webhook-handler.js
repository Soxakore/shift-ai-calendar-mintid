// Webhook handler for external integrations
export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Source, X-Webhook-Signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const webhookSource = event.headers['x-webhook-source'] || 'unknown';
    const signature = event.headers['x-webhook-signature'];
    const payload = JSON.parse(event.body);

    console.log(`Webhook received from ${webhookSource}:`, payload);

    // Handle different webhook sources
    switch (webhookSource) {
      case 'supabase':
        return await handleSupabaseWebhook(payload);
      
      case 'payment':
        return await handlePaymentWebhook(payload, signature);
      
      case 'calendar':
        return await handleCalendarWebhook(payload);
      
      case 'notification':
        return await handleNotificationWebhook(payload);
      
      default:
        return await handleGenericWebhook(payload, webhookSource);
    }

  } catch (error) {
    console.error('Webhook error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Webhook processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Supabase webhook handler
async function handleSupabaseWebhook(payload) {
  const { table, record, old_record, type } = payload;
  
  console.log(`Supabase ${type} event on ${table}:`, record);
  
  // Handle different table events
  switch (table) {
    case 'users':
      if (type === 'INSERT') {
        await handleNewUserRegistration(record);
      }
      break;
      
    case 'shifts':
      if (type === 'UPDATE') {
        await handleShiftUpdate(record, old_record);
      }
      break;
      
    case 'organizations':
      if (type === 'INSERT') {
        await handleNewOrganization(record);
      }
      break;
  }
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      success: true, 
      processed: table,
      type,
      timestamp: new Date().toISOString()
    })
  };
}

// Payment webhook handler
async function handlePaymentWebhook(payload, signature) {
  // Verify signature (implement based on payment provider)
  if (!verifyPaymentSignature(payload, signature)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }
  
  const { event_type, customer_id, amount, status } = payload;
  
  console.log(`Payment ${event_type}: ${customer_id} - ${amount} - ${status}`);
  
  // Process payment event
  if (event_type === 'payment.succeeded') {
    await handleSuccessfulPayment(customer_id, amount);
  } else if (event_type === 'payment.failed') {
    await handleFailedPayment(customer_id, amount);
  }
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      success: true, 
      event_type,
      processed_at: new Date().toISOString()
    })
  };
}

// Calendar integration webhook
async function handleCalendarWebhook(payload) {
  const { event_type, calendar_id, event_id, start_time, end_time } = payload;
  
  console.log(`Calendar ${event_type}: ${event_id} in ${calendar_id}`);
  
  // Sync with internal scheduling system
  if (event_type === 'event.created') {
    await syncCalendarEvent(calendar_id, event_id, start_time, end_time);
  }
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      success: true, 
      synced: event_id,
      timestamp: new Date().toISOString()
    })
  };
}

// Notification webhook handler
async function handleNotificationWebhook(payload) {
  const { notification_type, recipient_id, message, priority } = payload;
  
  console.log(`Notification ${notification_type} for ${recipient_id}: ${message}`);
  
  // Process notification
  await sendNotificationToUser(recipient_id, message, notification_type, priority);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      success: true, 
      notification_sent: true,
      recipient_id,
      timestamp: new Date().toISOString()
    })
  };
}

// Generic webhook handler
async function handleGenericWebhook(payload, source) {
  console.log(`Generic webhook from ${source}:`, payload);
  
  // Log to analytics or processing queue
  await logWebhookEvent(source, payload);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      success: true, 
      message: 'Webhook received and logged',
      source,
      timestamp: new Date().toISOString()
    })
  };
}

// Helper functions (implement based on your needs)
async function handleNewUserRegistration(user) {
  // Send welcome email, setup default preferences, etc.
  console.log('New user registered:', user.email);
}

async function handleShiftUpdate(newShift, oldShift) {
  // Notify affected users, update calendars, etc.
  console.log('Shift updated:', newShift.id);
}

async function handleNewOrganization(org) {
  // Setup organization defaults, notify admin, etc.
  console.log('New organization created:', org.name);
}

async function handleSuccessfulPayment(customerId, amount) {
  // Update subscription status, send receipt, etc.
  console.log('Payment succeeded:', customerId, amount);
}

async function handleFailedPayment(customerId, amount) {
  // Notify customer, retry payment, etc.
  console.log('Payment failed:', customerId, amount);
}

async function syncCalendarEvent(calendarId, eventId, startTime, endTime) {
  // Sync external calendar with internal system
  console.log('Syncing calendar event:', eventId);
}

async function sendNotificationToUser(userId, message, type, priority) {
  // Send notification via appropriate channel
  console.log('Sending notification:', userId, type, priority);
}

async function logWebhookEvent(source, payload) {
  // Log to analytics system
  console.log('Logging webhook event:', source);
}

function verifyPaymentSignature(payload, signature) {
  // Implement signature verification based on payment provider
  return true; // Simplified for demo
}
