import { CosmosClient } from "@azure/cosmos";

// Vercel Function to handle LSBA boxers
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // CosmosDB connection (server-side only)
  const client = new CosmosClient({
    endpoint: process.env.COSMOSDB_ENDPOINT,
    key: process.env.COSMOSDB_KEY,
  });

  const database = client.database(process.env.COSMOSDB_DATABASE_ID || 'LSBADatabase');
  const container = database.container('boxers');

  try {
    switch (req.method) {
      case 'GET':
        const { resources } = await container.items.readAll().fetchAll();
        return res.json(resources);

      case 'POST':
        const { resource: created } = await container.items.create(req.body);
        return res.json(created);

      case 'PUT':
        const { resource: updated } = await container.item(req.body.id, req.body.id).replace(req.body);
        return res.json(updated);

      case 'DELETE':
        const { id } = req.query;
        await container.item(id, id).delete();
        return res.json({ deleted: true, id });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('CosmosDB error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
}