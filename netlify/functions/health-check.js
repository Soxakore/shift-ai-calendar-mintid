// Health check function for minatid.se
export const handler = async (event, context) => {
  const startTime = Date.now();
  
  // Check Supabase connection
  const checkSupabase = async () => {
    try {
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      return response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      return 'unhealthy';
    }
  };

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    domain: 'minatid.se',
    application: 'Shift AI Calendar',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    services: {
      supabase: await checkSupabase(),
      netlify: 'healthy'
    },
    performance: {
      responseTime: `${Date.now() - startTime}ms`,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    },
    features: {
      authentication: 'active',
      roleBasedAccess: 'active',
      shiftScheduling: 'active',
      notifications: 'active'
    }
  };
  
  const statusCode = health.services.supabase === 'healthy' ? 200 : 503;
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(health, null, 2)
  };
};
