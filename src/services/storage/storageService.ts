import { SCHEMA_VERSIONS, StorageSchema } from "./schemas";

export class StorageService {
  private static STORAGE_PREFIX = "finance_";

  /**
   * Get data from LocalStorage with type safety
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!item) return null;

      const parsed: StorageSchema<T> = JSON.parse(item);

      // Version check
      const expectedVersion =
        SCHEMA_VERSIONS[key as keyof typeof SCHEMA_VERSIONS];
      if (expectedVersion && parsed.version !== expectedVersion) {
        console.warn(
          `Schema version mismatch for ${key}. Expected: ${expectedVersion}, Got: ${parsed.version}`,
        );
        // In a real app, trigger migration here
      }

      return parsed.data;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data to LocalStorage
   */
  static set<T>(key: string, data: T): boolean {
    try {
      const schemaVersion =
        SCHEMA_VERSIONS[key as keyof typeof SCHEMA_VERSIONS] || "1.0.0";
      const item: StorageSchema<T> = {
        schema: key,
        version: schemaVersion,
        data,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove item from LocalStorage
   */
  static remove(key: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + key);
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
