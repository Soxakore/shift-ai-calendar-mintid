// Schedule export function for PDF/CSV generation
export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { scheduleId, format, dateRange, userRole } = JSON.parse(event.body);
    
    if (!scheduleId || !format) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'scheduleId and format are required' })
      };
    }

    // Verify authentication (simplified for demo)
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Authorization required' })
      };
    }

    // Mock schedule data (in real implementation, fetch from Supabase)
    const scheduleData = {
      id: scheduleId,
      title: `Weekly Schedule - ${new Date().toLocaleDateString()}`,
      organization: 'MinatID Organization',
      dateRange: dateRange || 'This Week',
      shifts: [
        {
          id: 1,
          employee: 'John Doe',
          role: 'Manager',
          date: '2025-06-09',
          startTime: '09:00',
          endTime: '17:00',
          location: 'Main Office'
        },
        {
          id: 2,
          employee: 'Jane Smith',
          role: 'Employee',
          date: '2025-06-09',
          startTime: '10:00',
          endTime: '18:00',
          location: 'Remote'
        },
        {
          id: 3,
          employee: 'Mike Johnson',
          role: 'Employee',
          date: '2025-06-10',
          startTime: '08:00',
          endTime: '16:00',
          location: 'Branch Office'
        }
      ],
      exportedBy: userRole || 'Manager',
      exportedAt: new Date().toISOString()
    };

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Employee,Role,Date,Start Time,End Time,Location\n';
      const csvRows = scheduleData.shifts.map(shift => 
        `"${shift.employee}","${shift.role}","${shift.date}","${shift.startTime}","${shift.endTime}","${shift.location}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="schedule-${scheduleId}-${Date.now()}.csv"`
        },
        body: csvContent
      };
    }

    if (format === 'json') {
      // Return JSON format for API integrations
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          data: scheduleData,
          exportFormat: format,
          generatedAt: new Date().toISOString()
        })
      };
    }

    // For PDF format, return a simple HTML that can be converted to PDF client-side
    if (format === 'html') {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Schedule Export - ${scheduleData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${scheduleData.title}</h1>
            <p>${scheduleData.organization}</p>
          </div>
          
          <div class="info">
            <p><strong>Date Range:</strong> ${scheduleData.dateRange}</p>
            <p><strong>Exported by:</strong> ${scheduleData.exportedBy}</p>
            <p><strong>Exported at:</strong> ${new Date(scheduleData.exportedAt).toLocaleString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${scheduleData.shifts.map(shift => `
                <tr>
                  <td>${shift.employee}</td>
                  <td>${shift.role}</td>
                  <td>${shift.date}</td>
                  <td>${shift.startTime}</td>
                  <td>${shift.endTime}</td>
                  <td>${shift.location}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated by MinatID Shift Scheduling System - minatid.se</p>
          </div>
        </body>
        </html>
      `;
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/html'
        },
        body: htmlContent
      };
    }

    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Unsupported format',
        supportedFormats: ['csv', 'json', 'html']
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
