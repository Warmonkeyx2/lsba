import { CosmosClient, Container, Database } from "@azure/cosmos";
import { validateEnv, formatValidationErrors } from "./validation";

// Validate environment variables
const envValidation = validateEnv();
if (!envValidation.success) {
  const errorMessage = `Invalid environment configuration: ${formatValidationErrors(envValidation.error)}`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

// CosmosDB configuration
const endpoint = import.meta.env.VITE_COSMOSDB_ENDPOINT;
const key = import.meta.env.VITE_COSMOSDB_KEY;
const databaseId = import.meta.env.VITE_COSMOSDB_DATABASE_ID || "lsba";

if (!endpoint || !key) {
  throw new Error("CosmosDB endpoint and key must be provided in environment variables");
}

// Create CosmosDB client
export const cosmosClient = new CosmosClient({
  endpoint,
  key,
  connectionPolicy: {
    enableEndpointDiscovery: false,
  }
});

// Database reference
let database: Database;
let containers: { [key: string]: Container } = {};

// Initialize database and containers
export const initializeCosmosDB = async () => {
  try {
    // Create database if it doesn't exist
    const { database: db } = await cosmosClient.databases.createIfNotExists({
      id: databaseId
    });
    database = db;

    // Initialize containers for different collections
    const containerConfigs = [
      { id: "boxers", partitionKey: "/id" },
      { id: "fights", partitionKey: "/id" },
      { id: "sponsors", partitionKey: "/id" },
      { id: "tournaments", partitionKey: "/id" },
      { id: "betting", partitionKey: "/id" },
      { id: "rankings", partitionKey: "/id" },
      { id: "licenses", partitionKey: "/id" },
      { id: "roles", partitionKey: "/id" },
      { id: "permissions", partitionKey: "/id" },
      { id: "app_settings", partitionKey: "/id" }
    ];

    // Create containers if they don't exist
    for (const config of containerConfigs) {
      const { container } = await database.containers.createIfNotExists({
        id: config.id,
        partitionKey: config.partitionKey
      });
      containers[config.id] = container;
    }

    console.log("CosmosDB initialized successfully");
  } catch (error) {
    console.error("Error initializing CosmosDB:", error);
    throw error;
  }
};

// Helper functions to get containers
export const getContainer = (containerName: string): Container => {
  if (!containers[containerName]) {
    throw new Error(`Container ${containerName} not initialized`);
  }
  return containers[containerName];
};

// Database operations helpers
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
  }
};

// Initialize on module load (only in browser environment)
if (typeof window !== 'undefined') {
  initializeCosmosDB().catch(console.error);
}