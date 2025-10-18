exports.handler = async (event, context) => {
  console.log('FUNCTION STARTED');
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Test if function works at all
    console.log('FUNCTION IS WORKING');
    
    const apiKey = process.env.CLAUDE_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      console.log('NO API KEY FOUND');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No API key configured' })
      };
    }
    
    console.log('API KEY FOUND');
    
    const requestData = JSON.parse(event.body);
    console.log('CALLING CLAUDE API');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestData)
    });

    console.log('CLAUDE RESPONSE:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('CLAUDE ERROR:', errorText);
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `API error: ${response.status}` })
      };
    }

    const data = await response.json();
    console.log('SUCCESS');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.log('FUNCTION ERROR:', error.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Function failed' })
    };
  }
};
