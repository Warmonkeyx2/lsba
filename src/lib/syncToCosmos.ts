import { apiClient } from './apiClient';

/**
 * Persist local items that don't have CosmosDB metadata (createdAt) yet.
 * This avoids overwriting server-side records and only creates missing entries.
 */
export async function persistNewItems(containerName: string, items: Array<any>) {
  if (!items || items.length === 0) return { created: 0, skipped: 0 };

  let created = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      // If item already has createdAt (persisted), skip
      if (item && item.createdAt) {
        skipped++;
        continue;
      }

      // Ensure we don't accidentally create undefined items
      const toCreate = { ...item };
      // If no id provided, cosmosDB.create will generate one
      await apiClient.create(containerName, toCreate);
      created++;
    } catch (err) {
      // Log and continue
      console.warn(`persistNewItems: failed to create item in ${containerName}`, err);
    }
  }

  return { created, skipped };
}

/**
 * Persist a single object (e.g., settings) if it lacks createdAt
 */
export async function persistNewObject(containerName: string, obj?: any) {
  if (!obj) return { created: 0, skipped: 1 };
  if (obj.createdAt) return { created: 0, skipped: 1 };

  try {
    await apiClient.create(containerName, obj);
    return { created: 1, skipped: 0 };
  } catch (err) {
    console.warn(`persistNewObject: failed to create object in ${containerName}`, err);
    return { created: 0, skipped: 0 };
  }
}
