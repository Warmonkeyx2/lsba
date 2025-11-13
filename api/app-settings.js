import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient({
  endpoint: process.env.COSMOSDB_ENDPOINT,
  key: process.env.COSMOSDB_KEY
});

const database = client.database(process.env.COSMOSDB_DATABASE_ID || 'LSBADatabase');
const container = database.container('app_settings');

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
      // Get app settings
      try {
        const { resource } = await container.item('main', 'main').read();
        return res.status(200).json(resource || {});
      } catch (error) {
        if (error.code === 404) {
          // Return default settings if none exist
          const defaultSettings = {
            id: 'main',
            appTitle: 'LSBA Management System',
            appSubtitle: 'Professional Boxing Association Management',
            organizationName: 'Local State Boxing Association',
            primaryColor: 'oklch(0.70 0.20 142)',
            secondaryColor: 'oklch(0.80 0.15 85)',
            accentColor: 'oklch(0.85 0.18 90)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return res.status(200).json(defaultSettings);
        }
        throw error;
      }
    } else if (req.method === 'PUT') {
      // Update app settings
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
    console.error('App settings API error:', error);
    return res.status(500).json({ error: 'Failed to handle app settings request' });
  }
}