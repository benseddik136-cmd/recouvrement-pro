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
      const entries = data.value || [];

      // Grouper les paiements par client et par mois
      const paiements = {};

      entries.forEach(e => {
        if (e.documentType !== 'Payment') return;
        if (!e.customerNumber) return;

        const date = new Date(e.postingDate);
        const moisNum = date.getMonth() + 1;
        const annee = date.getFullYear();
        const moisKey = `${annee}-${String(moisNum).padStart(2, '0')}`;

        const key = e.customerNumber;
        if (!paiements[key]) {
          paiements[key] = {};
        }
        if (!paiements[key][moisKey]) {
          paiements[key][moisKey] = 0;
        }
        paiements[key][moisKey] += Math.abs(e.creditAmount || 0);
      });

      await redis.set('paiements', paiements);

      return res.status(200).json({
        success: true,
        count: Object.keys(paiements).length,
        updated: new Date().toISOString()
      });

    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const paiements = await redis.get('paiements') || {};
      return res.status(200).json({
        success: true,
        paiements: paiements,
        updated: new Date().toISOString()
      });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  return res.status(200).json({ message: 'Payments endpoint ready' });
}