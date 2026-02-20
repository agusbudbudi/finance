import { StorageService } from "../storage/storageService";
import { SupabaseStorageService } from "./supabaseStorageService";

export class CloudSyncService {
  /**
   * Migrate all local data to Supabase if it doesn't exist there.
   * This is intended to be run once after entering the Master Password.
   */
  static async performInitialSync(password: string): Promise<{ migrated: string[]; failed: string[] }> {
    const localKeys = StorageService.getAllKeys();
    const cloudKeys = await SupabaseStorageService.listKeys();
    const allKeys = Array.from(new Set([...localKeys, ...cloudKeys]));
    
    const migrated: string[] = [];
    const failed: string[] = [];

    for (const key of allKeys) {
      try {
        const hasLocal = StorageService.has(key);
        const cloudData = await SupabaseStorageService.get(key, password);
        
        if (!cloudData && hasLocal) {
          // Push local to cloud
          const localData = StorageService.get(key);
          if (localData) {
            const success = await SupabaseStorageService.set(key, localData, password);
            if (success) migrated.push(key);
            else failed.push(key);
          }
        } else if (cloudData && !hasLocal) {
          // Pull cloud to local
          await StorageService.set(key, cloudData);
          migrated.push(key);
        }
      } catch (error) {
        console.error(`Sync failed for ${key}:`, error);
        failed.push(key);
      }
    }

    return { migrated, failed };
  }

  /**
   * Download all data from cloud to local (useful for new devices)
   */
  static async pullFromCloud(password: string, keys: string[]): Promise<void> {
    for (const key of keys) {
      const data = await SupabaseStorageService.get(key, password);
      if (data) {
        StorageService.set(key, data);
      }
    }
  }
}
