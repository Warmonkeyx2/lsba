import { CosmosClient } from "@azure/cosmos";

// Vercel Function for LSBA Sponsors
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // CosmosDB connection
  const client = new CosmosClient({
    endpoint: process.env.COSMOSDB_ENDPOINT,
    key: process.env.COSMOSDB_KEY,
  });

  const database = client.database(process.env.COSMOSDB_DATABASE_ID || 'LSBADatabase');
  const container = database.container('sponsors');

  try {
    switch (req.method) {
      case 'GET':
        const { resources } = await container.items.readAll().fetchAll();
        return res.json(resources);

      case 'POST':
        const newSponsor = {
          ...req.body,
          id: req.body.id || crypto.randomUUID(),
          createdAt: new Date().toISOString()
        };
        const { resource: created } = await container.items.create(newSponsor);
        return res.json(created);

      case 'PUT':
        const { id } = req.query;
        const updatedSponsor = {
          ...req.body,
          id: id,
          updatedAt: new Date().toISOString()
        };
        const { resource: updated } = await container.item(id, id).replace(updatedSponsor);
        return res.json(updated);

      case 'DELETE':
        const { id: deleteId } = req.query;
        await container.item(deleteId, deleteId).delete();
        return res.json({ deleted: true, id: deleteId });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Sponsors API error:', error);
    return res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}