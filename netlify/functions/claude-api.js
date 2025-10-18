exports.handler = async (event, context) => {
  console.log('🚀 Function started - method:', event.httpMethod);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
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
    console.log('❌ Wrong method:', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('🔑 Checking API key...');
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.log('❌ No API key found');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }
    
    console.log('✅ API key found, length:', apiKey.length);
    
    console.log('📝 Parsing request body...');
    const requestData = JSON.parse(event.body);
    console.log('✅ Request parsed successfully');
    
    console.log('🌐 Calling Claude API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestData)
    });

    console.log('📊 Claude API status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Claude API error:', errorText);
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: `Claude API error: ${response.status}`,
          details: errorText 
        })
      };
    }

    const data = await response.json();
    console.log('🎉 Claude API success! Response length:', JSON.stringify(data).length);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.log('💥 Function error:', error.message);
    console.log('Stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Function failed',
        message: error.message
      })
    };
  }
};
