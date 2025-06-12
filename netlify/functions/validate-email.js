// Email validation function for shift scheduling application
export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    const { email } = JSON.parse(event.body);
    
    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Email validation logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    
    // Check for common domains
    const commonDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    const isCommonDomain = commonDomains.includes(domain);
    
    // Business email detection
    const isBusinessEmail = domain && !commonDomains.includes(domain) && domain.includes('.');
    
    // Suggestions for common typos
    const suggestions = [];
    if (!isValidFormat) {
      if (email.includes('@') && !email.includes('.')) {
        suggestions.push('Did you mean to add a domain extension like .com?');
      }
      if (!email.includes('@')) {
        suggestions.push('Email address must contain @ symbol');
      }
    }

    const result = {
      email,
      isValid: isValidFormat,
      domain,
      isCommonDomain,
      isBusinessEmail,
      suggestions,
      checks: {
        format: isValidFormat,
        domain: !!domain,
        length: email.length >= 5 && email.length <= 254
      },
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
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
