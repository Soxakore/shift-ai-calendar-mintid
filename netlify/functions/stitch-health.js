// Stitch MCP health check (server-side) so API keys stay off the client.
const STITCH_MCP_URL = 'https://stitch.googleapis.com/mcp';

const buildCorsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-cache',
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: buildCorsHeaders(),
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: buildCorsHeaders(),
      body: JSON.stringify({
        connected: false,
        configured: false,
        message: 'Method not allowed',
      }),
    };
  }

  const apiKey =
    process.env.STITCH_API_KEY ||
    process.env.GOOGLE_STITCH_API_KEY ||
    process.env.STITCH_GOOGLE_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 503,
      headers: buildCorsHeaders(),
      body: JSON.stringify({
        connected: false,
        configured: false,
        message: 'Stitch API key not configured on server',
        checkedAt: new Date().toISOString(),
      }),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(STITCH_MCP_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'health',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'minatid-netlify-health',
            version: '1.0.0',
          },
        },
      }),
    });

    const payload = await response.json().catch(() => ({}));
    clearTimeout(timeout);

    const connected = response.ok && !payload.error;
    return {
      statusCode: connected ? 200 : 502,
      headers: buildCorsHeaders(),
      body: JSON.stringify({
        connected,
        configured: true,
        statusCode: response.status,
        protocolVersion: payload?.result?.protocolVersion || null,
        serverInfo: payload?.result?.serverInfo || null,
        capabilities: payload?.result?.capabilities || null,
        message: connected
          ? 'Stitch MCP connected'
          : payload?.error?.message || 'Failed to connect to Stitch MCP',
        checkedAt: new Date().toISOString(),
      }),
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      statusCode: 502,
      headers: buildCorsHeaders(),
      body: JSON.stringify({
        connected: false,
        configured: true,
        message:
          error instanceof Error
            ? `Stitch MCP request failed: ${error.message}`
            : 'Stitch MCP request failed',
        checkedAt: new Date().toISOString(),
      }),
    };
  }
};
