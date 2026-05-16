exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const clients = data.value || [];
      
      const result = clients
        .filter(c => c.displayName && c.displayName.trim() !== '')
        .map(c => ({
          nom: c.displayName,
          total: parseFloat(c.balanceDue) || 0
        }))
        .filter(c => c.total !== 0)
        .sort((a, b) => b.total - a.total);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          clients: result, 
          updated: new Date().toISOString() 
        })
      };
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: e.message })
      };
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Sync endpoint ready' })
  };
};