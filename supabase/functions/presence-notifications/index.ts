import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface NotificationRequest {
  type: 'team_alert' | 'emergency' | 'announcement' | 'shift_change';
  message: string;
  channels?: string[];
  target_users?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender_id: string;
}

interface PresenceUser {
  user_id: string;
  username: string;
  display_name: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  current_activity?: string;
  location?: string;
  last_seen: string;
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const {
      type,
      message,
      channels = ['employee_workspace'],
      target_users,
      priority,
      sender_id
    }: NotificationRequest = await req.json();

    // Get sender information
    const { data: senderProfile, error: senderError } = await supabaseClient
      .from('profiles')
      .select('display_name, username, user_type')
      .eq('id', sender_id)
      .single();

    if (senderError) {
      throw new Error('Sender not found');
    }

    // Get all online users from presence channels
    const onlineUsers: PresenceUser[] = [];
    const notificationResults = [];

    for (const channel of channels) {
      try {
        // In a real implementation, you'd query the realtime presence state
        // For this demo, we'll simulate getting online users
        console.log(`Checking presence in channel: ${channel}`);
        
        // Simulate presence data (in real implementation, this would come from Realtime)
        const simulatedPresence = await getSimulatedPresenceData(supabaseClient, channel);
        onlineUsers.push(...simulatedPresence);
      } catch (error) {
        console.error(`Error getting presence for channel ${channel}:`, error);
      }
    }

    // Filter users based on target_users if specified
    let targetUsers = onlineUsers;
    if (target_users && target_users.length > 0) {
      targetUsers = onlineUsers.filter(user => target_users.includes(user.user_id));
    }

    // Filter out offline users for urgent notifications
    if (priority === 'urgent') {
      targetUsers = targetUsers.filter(user => user.status === 'online');
    }

    // Create notification payload
    const notification = {
      id: crypto.randomUUID(),
      type,
      message,
      priority,
      sender: {
        id: sender_id,
        name: senderProfile.display_name || senderProfile.username,
        role: senderProfile.user_type
      },
      timestamp: new Date().toISOString(),
      channels
    };

    // Send notifications based on user status and activity
    for (const user of targetUsers) {
      const userNotification = {
        ...notification,
        recipient: {
          id: user.user_id,
          name: user.display_name,
          status: user.status,
          activity: user.current_activity,
          location: user.location
        }
      };

      // Determine notification method based on user status and priority
      const notificationMethods = determineNotificationMethods(user, priority);
      
      for (const method of notificationMethods) {
        try {
          const result = await sendNotificationByMethod(method, userNotification, user);
          notificationResults.push({
            user_id: user.user_id,
            method,
            status: 'sent',
            result
          });
        } catch (error) {
          notificationResults.push({
            user_id: user.user_id,
            method,
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    // Log notification activity
    const activityLog = {
      type: 'notification_sent',
      sender_id,
      notification_type: type,
      priority,
      channels,
      target_count: targetUsers.length,
      online_count: onlineUsers.filter(u => u.status === 'online').length,
      success_count: notificationResults.filter(r => r.status === 'sent').length,
      timestamp: new Date().toISOString()
    };

    console.log('Notification activity:', activityLog);

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: notification.id,
        message: `Notification sent to ${targetUsers.length} users`,
        summary: {
          total_users: targetUsers.length,
          online_users: onlineUsers.filter(u => u.status === 'online').length,
          notifications_sent: notificationResults.filter(r => r.status === 'sent').length,
          notifications_failed: notificationResults.filter(r => r.status === 'failed').length
        },
        results: notificationResults
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );

  } catch (error) {
    console.error('Error sending presence notifications:', error);
    
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

// Simulate getting presence data (in real implementation, this would use Realtime API)
async function getSimulatedPresenceData(supabase: any, channel: string): Promise<PresenceUser[]> {
  // In a real implementation, you'd get this from the Realtime presence state
  // For demo purposes, we'll query active users from the database
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, user_type, is_active')
    .eq('is_active', true)
    .limit(10);

  if (error) {
    console.error('Error getting profiles:', error);
    return [];
  }

  // Simulate presence status
  return profiles.map((profile: any) => ({
    user_id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    status: Math.random() > 0.3 ? 'online' : 'away', // 70% online
    current_activity: Math.random() > 0.5 ? 'working' : 'idle',
    location: channel,
    last_seen: new Date().toISOString()
  }));
}

// Determine notification methods based on user status and priority
function determineNotificationMethods(user: PresenceUser, priority: string): string[] {
  const methods = [];

  if (user.status === 'online') {
    methods.push('realtime'); // Browser notification
    
    if (priority === 'high' || priority === 'urgent') {
      methods.push('email');
    }
    
    if (priority === 'urgent') {
      methods.push('sms');
    }
  } else if (user.status === 'away') {
    methods.push('email');
    
    if (priority === 'urgent') {
      methods.push('sms');
      methods.push('push'); // Mobile push notification
    }
  } else {
    // User is busy or offline
    if (priority === 'high' || priority === 'urgent') {
      methods.push('email');
    }
    
    if (priority === 'urgent') {
      methods.push('sms');
      methods.push('push');
    }
  }

  return methods;
}

// Send notification using specific method
async function sendNotificationByMethod(method: string, notification: any, user: PresenceUser) {
  switch (method) {
    case 'realtime':
      return sendRealtimeNotification(notification, user);
    case 'email':
      return sendEmailNotification(notification, user);
    case 'sms':
      return sendSMSNotification(notification, user);
    case 'push':
      return sendPushNotification(notification, user);
    default:
      throw new Error(`Unknown notification method: ${method}`);
  }
}

async function sendRealtimeNotification(notification: any, user: PresenceUser) {
  // In real implementation, this would send via Supabase Realtime
  console.log(`📱 Realtime notification to ${user.display_name}:`, notification.message);
  return { method: 'realtime', status: 'delivered', timestamp: new Date().toISOString() };
}

async function sendEmailNotification(notification: any, user: PresenceUser) {
  // In real implementation, this would integrate with an email service
  console.log(`📧 Email notification to ${user.display_name}:`, notification.message);
  return { method: 'email', status: 'sent', timestamp: new Date().toISOString() };
}

async function sendSMSNotification(notification: any, user: PresenceUser) {
  // In real implementation, this would integrate with SMS service (Twilio, etc.)
  console.log(`📱 SMS notification to ${user.display_name}:`, notification.message);
  return { method: 'sms', status: 'sent', timestamp: new Date().toISOString() };
}

async function sendPushNotification(notification: any, user: PresenceUser) {
  // In real implementation, this would integrate with push notification service
  console.log(`🔔 Push notification to ${user.display_name}:`, notification.message);
  return { method: 'push', status: 'sent', timestamp: new Date().toISOString() };
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/presence-notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
