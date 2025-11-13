import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient({
  endpoint: process.env.COSMOSDB_ENDPOINT,
  key: process.env.COSMOSDB_KEY
});

const database = client.database(process.env.COSMOSDB_DATABASE_ID || 'LSBADatabase');
const container = database.container('payout_settings');

function addCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  addCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get payout settings
      try {
        const { resource } = await container.item('main', 'main').read();
        return res.status(200).json(resource || {});
      } catch (error) {
        if (error.code === 404) {
          // Return default payout settings if none exist
          const defaultPayoutSettings = {
            id: 'main',
            taxRate: 0.15,
            bonusEnabled: true,
            bonusPercentage: 0.10,
            minBonusAmount: 50,
            maxBonusAmount: 1000,
            retentionPercentage: 0.05,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return res.status(200).json(defaultPayoutSettings);
        }
        throw error;
      }
    } else if (req.method === 'PUT') {
      // Update payout settings
      const settings = req.body;
      const settingsWithMeta = {
        ...settings,
        id: 'main',
        updatedAt: new Date().toISOString()
      };

      const { resource } = await container.item('main', 'main').upsert(settingsWithMeta);
      return res.status(200).json(resource);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Payout settings API error:', error);
    return res.status(500).json({ error: 'Failed to handle payout settings request' });
  }
}