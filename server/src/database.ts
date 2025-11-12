import { CosmosClient, Container, Database } from "@azure/cosmos";
import dotenv from 'dotenv';

dotenv.config();

// CosmosDB configuration from environment
const endpoint = process.env.COSMOSDB_ENDPOINT;
const key = process.env.COSMOSDB_KEY;
const databaseId = process.env.COSMOSDB_DATABASE_ID || "LSBADatabase";

if (!endpoint || !key) {
  throw new Error("CosmosDB endpoint and key must be provided in environment variables");
}

// Create CosmosDB client
export const cosmosClient = new CosmosClient({
  endpoint,
  key,
});

// Database reference
let database: Database;
let containers: { [key: string]: Container } = {};

// Initialize database and containers
export const initializeCosmosDB = async () => {
  try {
    console.log('Initializing CosmosDB connection...');
    
    // Get existing database (don't create if it doesn't exist)
    try {
      database = cosmosClient.database(databaseId);
      
      // Test database connection
      await database.read();
      console.log(`Connected to database: ${databaseId}`);
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }

    // Define container configurations
    const containerConfigs = [
      { id: "boxers", partitionKey: "/id" },
      { id: "fights", partitionKey: "/id" },
      { id: "sponsors", partitionKey: "/id" }
    ];

    // Connect to existing containers (don't create new ones)
    for (const config of containerConfigs) {
      try {
        containers[config.id] = database.container(config.id);
        // Test container connection - don't fail if container doesn't exist
        try {
          await containers[config.id].read();
          console.log(`Container '${config.id}' connected`);
        } catch (readError: any) {
          if (readError.code === 404) {
            console.warn(`Container '${config.id}' not found - will be created on first use`);
          } else {
            console.warn(`Container '${config.id}' connection issue:`, readError.message);
          }
        }
      } catch (error: any) {
        console.warn(`Failed to set up container '${config.id}':`, error.message);
      }
    }

    console.log("CosmosDB initialized successfully");
  } catch (error) {
    console.error("Error initializing CosmosDB:", error);
    throw error;
  }
};

// Helper function to get containers
export const getContainer = (containerName: string): Container => {
  if (!containers[containerName]) {
    throw new Error(`Container ${containerName} not initialized`);
  }
  return containers[containerName];
};

// Database operations
export const cosmosDB = {
  // Generic CRUD operations
  async create<T>(containerName: string, item: T & { id?: string }): Promise<T> {
    const container = getContainer(containerName);
    const { resource } = await container.items.create({
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return resource as T;
  },

  async read<T = any>(containerName: string, id: string): Promise<T | null> {
    const container = getContainer(containerName);
    try {
      const { resource } = await container.item(id, id).read();
      return (resource as T) || null;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  },

  async update<T = any>(containerName: string, id: string, item: Partial<T>): Promise<T> {
    const container = getContainer(containerName);
    const existing = await this.read(containerName, id);
    if (!existing) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    const updatedItem = {
      ...existing,
      ...item,
      id,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await container.item(id, id).replace(updatedItem);
    return resource as T;
  },

  async delete(containerName: string, id: string): Promise<void> {
    const container = getContainer(containerName);
    await container.item(id, id).delete();
  },

  async query<T = any>(containerName: string, querySpec: string | { query: string; parameters?: any[] }): Promise<T[]> {
    const container = getContainer(containerName);
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources as T[];
  },

  async list<T = any>(containerName: string, maxItemCount?: number): Promise<T[]> {
    const container = getContainer(containerName);
    const options = maxItemCount ? { maxItemCount } : {};
    const { resources } = await container.items.readAll(options).fetchAll();
    return resources as T[];
  },

  async createBatch<T>(containerName: string, items: (T & { id?: string })[]): Promise<T[]> {
    const results: T[] = [];
    for (const item of items) {
      try {
        const result = await this.create(containerName, item);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to create item in batch:`, error);
      }
    }
    return results;
  }
};