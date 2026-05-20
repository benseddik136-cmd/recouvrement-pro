const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

const VENDEURS = {
  "1": "REPRESENTANT 1",
  "2": "MR DAAL MOHAMED",
  "3": "MR BENSEDDIK ZAKARIA",
  "4": "MR NACIRI MOHAMED",
  "5": "MME MOUTAFARRIJ KHADIJA",
  "6": "MR NABIL EL BAKKAL",
  "7": "MOHAMED SEBBAR",
  "8": "MR HAROU MOUHCINE",
  "9": "MEHDI LAGNAOUI",
  "10": "MR LAKHAL ABDELLAH",
  "11": "CONTENTIEUX",
  "12": "SABRANE ZAKARIA",
  "13": "TAYEB CHRAIBI",
  "15": "LABIAD ANAS"
};

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const data = req.body || {};
      const clients = data.value || [];

      // Get payments from Redis
      const paiements = await redis.get('paiements') || {};

      const result = clients
        .filter(c => c.displayName && c.displayName.trim() !== '')
        .map(c => {
          const nom = c.displayName;
          const total = parseFloat(c.balanceDue) || 0;
          const vendeur = VENDEURS[String(c.salespersonCode)] || c.salespersonCode || "NON AFFECTÉ";
          
          // Try all possible customer number fields
          const customerNo = c.number || c.id || c.customerNumber || "";

          // Get payments for this customer
          const customerPayments = paiements[customerNo] || {};

          return {
            nom,
            total,
            vendeur,
            customerNo,
            paiements: customerPayments
          };
        })
        .filter(c => c.total !== 0)
        .sort((a, b) => b.total - a.total);

      // Debug: log first client to see structure
      if (clients.length > 0) {
        console.log('First client keys:', Object.keys(clients[0]));
        console.log('First client:', JSON.stringify(clients[0]).substring(0, 200));
      }

      await redis.set('clients', result);

      return res.status(200).json({
        success: true,
        count: result.length,
        sample: result.length > 0 ? result[0] : null,
        updated: new Date().toISOString()
      });

    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const clients = await redis.get('clients') || [];
      return res.status(200).json({
        success: true,
        clients: clients,
        updated: new Date().toISOString()
      });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  return res.status(200).json({ message: 'Sync endpoint ready' });
}
