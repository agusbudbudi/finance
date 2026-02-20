import { SCHEMA_VERSIONS, StorageSchema } from "./schemas";
import { SupabaseStorageService } from "../supabase/supabaseStorageService";
import { useAuthStore } from "../../stores/useAuthStore";
import { EncryptionService } from "./encryptionService";

export class StorageService {
  private static STORAGE_PREFIX = "finance_";
  private static sessionCache: Record<string, any> = {};

  /**
   * Unlock the local session by decrypting and caching data in memory.
   */
  static async unlockSession(password: string): Promise<void> {
    const keys = this.getAllKeys();
    for (const key of keys) {
      try {
        const item = localStorage.getItem(this.STORAGE_PREFIX + key);
        if (!item) continue;

        const parsed: any = JSON.parse(item);
        
        // If it's an encrypted blob (has ciphertext directly)
        if (parsed && typeof parsed === 'object' && 'ciphertext' in parsed && 'iv' in parsed) {
          const decrypted = await EncryptionService.decrypt(parsed, password);
          const decryptedSchema: StorageSchema<any> = JSON.parse(decrypted);
          this.sessionCache[key] = decryptedSchema.data;
        } else if (parsed && parsed.data !== undefined) {
          // Plain data (legacy or unencrypted)
          this.sessionCache[key] = parsed.data;
        }
      } catch (error) {
        console.error(`Failed to decrypt ${key} during session unlock:`, error);
      }
    }
  }

  /**
   * Get data from Session Cache (Synchronous)
   */
  static get<T>(key: string): T | null {
    if (this.sessionCache[key] !== undefined) {
      return this.sessionCache[key] as T;
    }
    
    // Fallback if not in cache (e.g. settings that might not be encrypted)
    try {
      const item = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!item) return null;

      const parsed: any = JSON.parse(item);
      
      // If it looks encrypted and we don't have it in cache, we can't return it
      if (parsed && typeof parsed === 'object' && 'ciphertext' in parsed && 'iv' in parsed) {
        return null;
      }

      // Legacy plain data
      if (parsed && typeof parsed === 'object' && 'data' in parsed) {
        return parsed.data as T;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set data to LocalStorage (encrypted) and update cache
   */
  static async set<T>(key: string, data: T): Promise<boolean> {
    try {
      this.sessionCache[key] = data; // Update memory cache
      
      const { masterPassword, isUnlocked } = useAuthStore.getState();
      const schemaVersion =
        SCHEMA_VERSIONS[key as keyof typeof SCHEMA_VERSIONS] || "1.0.0";
      
      const schemaItem: StorageSchema<T> = {
        schema: key,
        version: schemaVersion,
        data,
        updatedAt: new Date().toISOString(),
      };

      let finalItemToStore: string;

      if (isUnlocked && masterPassword) {
        // Encrypt for local storage
        const encrypted = await EncryptionService.encrypt(JSON.stringify(schemaItem), masterPassword);
        finalItemToStore = JSON.stringify(encrypted);

        // Also sync to Supabase in background
        SupabaseStorageService.set(key, data, masterPassword).catch((err) =>
          console.error(`Cloud sync failed for ${key}:`, err),
        );
      } else {
        // If not unlocked, we shouldn't really be saving sensitive financial data in plain text
        // But for things like 'settings' (unencrypted), we could allow it.
        // For now, let's just save it as is but wrap it.
        finalItemToStore = JSON.stringify(schemaItem);
      }

      localStorage.setItem(this.STORAGE_PREFIX + key, finalItemToStore);
      return true;
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove item from LocalStorage and Supabase
   */
  static remove(key: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + key);

    // Trigger sync to Supabase if unlocked
    const { isUnlocked } = useAuthStore.getState();
    if (isUnlocked) {
      SupabaseStorageService.remove(key).catch((err) =>
        console.error(`Cloud remove failed for ${key}:`, err),
      );
    }
  }

  /**
   * Clear all app data
   */
  static clearAll(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Export all data (for backup)
   */
  static exportAll(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        const cleanKey = key.replace(this.STORAGE_PREFIX, "");
        data[cleanKey] = this.get(cleanKey);
      }
    });
    return data;
  }

  /**
   * Import data (for restore)
   */
  static importAll(data: Record<string, unknown>): boolean {
    try {
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  static has(key: string): boolean {
    return localStorage.getItem(this.STORAGE_PREFIX + key) !== null;
  }

  /**
   * Get all keys
   */
  static getAllKeys(): string[] {
    const keys: string[] = [];
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        keys.push(key.replace(this.STORAGE_PREFIX, ""));
      }
    });
    return keys;
  }
}
