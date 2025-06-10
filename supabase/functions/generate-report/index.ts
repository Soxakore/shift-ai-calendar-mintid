import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface ReportRequest {
  report_type: 'monthly' | 'weekly' | 'custom';
  start_date?: string;
  end_date?: string;
  employee_id?: string;
  department_id?: string;
  organisation_id?: string;
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
      report_type,
      start_date,
      end_date,
      employee_id,
      department_id,
      organisation_id
    }: ReportRequest = await req.json();

    // Calculate date range based on report type
    let startDate: string;
    let endDate: string;

    const now = new Date();
    
    if (report_type === 'weekly') {
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      startDate = weekStart.toISOString().split('T')[0];
      endDate = weekEnd.toISOString().split('T')[0];
    } else if (report_type === 'monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = monthStart.toISOString().split('T')[0];
      endDate = monthEnd.toISOString().split('T')[0];
    } else {
      startDate = start_date || new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
      endDate = end_date || new Date().toISOString().split('T')[0];
    }

    // Build query based on filters
    let query = supabaseClient
      .from('time_logs')
      .select(`
        *,
        profiles:employee_id (
          id,
          display_name,
          username,
          department_id,
          organization_id
        ),
        schedules:schedule_id (
          scheduled_date,
          shift_type,
          start_time,
          end_time
        )
      `)
      .gte('clock_in_time', startDate)
      .lte('clock_in_time', endDate + 'T23:59:59');

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    const { data: timeLogs, error } = await query;

    if (error) {
      throw error;
    }

    // Filter by department or organisation if specified
    let filteredLogs = timeLogs || [];
    if (department_id || organisation_id) {
      filteredLogs = filteredLogs.filter(log => {
        const profile = log.profiles;
        if (department_id && profile?.department_id !== department_id) return false;
        if (organisation_id && profile?.organization_id !== organisation_id) return false;
        return true;
      });
    }

    // Generate report data
    const reportData = {
      period: {
        start_date: startDate,
        end_date: endDate,
        report_type
      },
      summary: {
        total_employees: new Set(filteredLogs.map(log => log.employee_id)).size,
        total_work_sessions: filteredLogs.length,
        total_hours_worked: 0,
        average_hours_per_day: 0,
        average_hours_per_employee: 0
      },
      employee_breakdown: [] as any[],
      daily_breakdown: [] as any[]
    };

    // Calculate total hours and build employee breakdown
    const employeeStats = new Map();
    const dailyStats = new Map();

    for (const log of filteredLogs) {
      if (!log.clock_out_time) continue; // Skip incomplete sessions

      const clockIn = new Date(log.clock_in_time);
      const clockOut = new Date(log.clock_out_time);
      const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      
      reportData.summary.total_hours_worked += hoursWorked;

      // Employee stats
      const employeeId = log.employee_id;
      if (!employeeStats.has(employeeId)) {
        employeeStats.set(employeeId, {
          employee_id: employeeId,
          employee_name: log.profiles?.display_name || log.profiles?.username || 'Unknown',
          total_hours: 0,
          total_sessions: 0,
          average_session_duration: 0
        });
      }
      
      const empStat = employeeStats.get(employeeId);
      empStat.total_hours += hoursWorked;
      empStat.total_sessions += 1;
      empStat.average_session_duration = empStat.total_hours / empStat.total_sessions;

      // Daily stats
      const workDate = clockIn.toISOString().split('T')[0];
      if (!dailyStats.has(workDate)) {
        dailyStats.set(workDate, {
          date: workDate,
          total_hours: 0,
          total_employees: new Set(),
          total_sessions: 0
        });
      }
      
      const dayStat = dailyStats.get(workDate);
      dayStat.total_hours += hoursWorked;
      dayStat.total_employees.add(employeeId);
      dayStat.total_sessions += 1;
    }

    // Convert maps to arrays and calculate averages
    reportData.employee_breakdown = Array.from(employeeStats.values())
      .sort((a, b) => b.total_hours - a.total_hours);

    reportData.daily_breakdown = Array.from(dailyStats.values())
      .map(day => ({
        ...day,
        total_employees: day.total_employees.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate final averages
    const workingDays = reportData.daily_breakdown.length;
    const totalEmployees = reportData.summary.total_employees;
    
    reportData.summary.average_hours_per_day = workingDays > 0 ? 
      reportData.summary.total_hours_worked / workingDays : 0;
    
    reportData.summary.average_hours_per_employee = totalEmployees > 0 ? 
      reportData.summary.total_hours_worked / totalEmployees : 0;

    // Round numbers for better presentation
    reportData.summary.total_hours_worked = Math.round(reportData.summary.total_hours_worked * 100) / 100;
    reportData.summary.average_hours_per_day = Math.round(reportData.summary.average_hours_per_day * 100) / 100;
    reportData.summary.average_hours_per_employee = Math.round(reportData.summary.average_hours_per_employee * 100) / 100;

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );

  } catch (error) {
    console.error('Error generating report:', error);
    
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-report' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
