import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface ScheduleReminderRequest {
  employee_id?: string;
  days_ahead?: number;
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

    const { employee_id, days_ahead = 1 }: ScheduleReminderRequest = await req.json();

    // Get upcoming schedules
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + days_ahead);
    
    let query = supabaseClient
      .from('schedules')
      .select(`
        *,
        profiles:employee_id (
          id,
          display_name,
          username
        )
      `)
      .gte('scheduled_date', tomorrow.toISOString().split('T')[0])
      .lt('scheduled_date', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw error;
    }

    // Process reminders for each schedule
    const reminders = [];
    for (const schedule of schedules || []) {
      // Here you would typically send an email, SMS, or push notification
      // For now, we'll just log the reminder data
      
      const reminderData = {
        employee_id: schedule.employee_id,
        employee_name: schedule.profiles?.display_name || schedule.profiles?.username,
        schedule_date: schedule.scheduled_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        shift_type: schedule.shift_type,
        message: `Reminder: You have a ${schedule.shift_type} shift tomorrow from ${schedule.start_time} to ${schedule.end_time}`
      };

      reminders.push(reminderData);

      // Log the reminder (in production, you'd send actual notifications)
      console.log('Schedule Reminder:', reminderData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${reminders.length} schedule reminders`,
        reminders: reminders
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );

  } catch (error) {
    console.error('Error processing schedule reminders:', error);
    
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/schedule-reminder' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
