export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      const clients = data.value || [];

      const result = clients
        .filter(c => c.displayName && c.displayName.trim() !== '')
        .map(c => ({
          nom: c.displayName,
          total: parseFloat(c.balanceDue) || 0
        }))
        .filter(c => c.total !== 0)
        .sort((a, b) => b.total - a.