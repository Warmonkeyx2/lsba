import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeCosmosDB, cosmosDB } from './database';
import { z } from 'zod';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Validation schemas
const ItemSchema = z.object({
  id: z.string().optional(),
}).passthrough(); // Allow additional properties

const BatchItemsSchema = z.object({
  items: z.array(ItemSchema)
});

const UpdateItemSchema = z.object({
  id: z.string(),
  data: z.record(z.any())
});

// Generic CRUD routes
app.post('/api/:container', async (req, res) => {
  try {
    const { container } = req.params;
    const item = ItemSchema.parse(req.body);
    
    const result = await cosmosDB.create(container, item);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/:container/batch', async (req, res) => {
  try {
    const { container } = req.params;
    const { items } = BatchItemsSchema.parse(req.body);
    
    const results = await cosmosDB.createBatch(container, items);
    res.status(201).json({ 
      success: true, 
      created: results.length, 
      items: results 
    });
  } catch (error: any) {
    console.error('Batch create error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/:container', async (req, res) => {
  try {
    const { container } = req.params;
    const { limit } = req.query;
    
    const maxItemCount = limit ? parseInt(limit as string) : undefined;
    const items = await cosmosDB.list(container, maxItemCount);
    
    res.json(items);
  } catch (error: any) {
    console.error('List error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:container/:id', async (req, res) => {
  try {
    const { container, id } = req.params;
    const item = await cosmosDB.read(container, id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error: any) {
    console.error('Read error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/:container/:id', async (req, res) => {
  try {
    const { container, id } = req.params;
    const data = z.record(z.any()).parse(req.body);
    
    const result = await cosmosDB.update(container, id, data);
    res.json(result);
  } catch (error: any) {
    console.error('Update error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/:container/:id', async (req, res) => {
  try {
    const { container, id } = req.params;
    await cosmosDB.delete(container, id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk sync endpoint for auto-sync functionality
app.post('/api/sync', async (req, res) => {
  try {
    const syncData = z.record(z.array(ItemSchema)).parse(req.body);
    const results: { [container: string]: { created: number; skipped: number } } = {};
    
    for (const [containerName, items] of Object.entries(syncData)) {
      let created = 0;
      let skipped = 0;
      
      for (const item of items) {
        // Only create items that don't have createdAt (local-only items)
        if (!item.createdAt) {
          try {
            await cosmosDB.create(containerName, item);
            created++;
          } catch (error) {
            console.warn(`Sync failed for item in ${containerName}:`, error);
          }
        } else {
          skipped++;
        }
      }
      
      results[containerName] = { created, skipped };
    }
    
    res.json({ success: true, results });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeCosmosDB();
    
    app.listen(PORT, () => {
      console.log(`LSBA API Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();