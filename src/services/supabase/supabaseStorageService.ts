import { supabase } from "./supabaseClient";
import { EncryptionService } from "../storage/encryptionService";

export class SupabaseStorageService {
  private static TABLE_NAME = "vault";

  /**
   * Get encrypted data from Supabase and decrypt it
   */
  static async get<T>(key: string, password: string): Promise<T | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("key", key)
        .eq("user_id", user.id)
        .single();

      if (error || !data) return null;

      const decrypted = await EncryptionService.decrypt(
        {
          ciphertext: data.ciphertext,
          iv: data.iv,
          salt: data.salt,
        },
        password
      );

      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error(`Error reading ${key} from Supabase:`, error);
      return null;
    }
  }

  /**
   * Encrypt data and save to Supabase
   */
  static async set<T>(key: string, data: T, password: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const jsonString = JSON.stringify(data);
      const encrypted = await EncryptionService.encrypt(jsonString, password);

      const { error } = await supabase.from(this.TABLE_NAME).upsert({
        user_id: user.id,
        key,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to Supabase:`, error);
      return false;
    }
  }

  /**
   * Remove item from Supabase
   */
  static async remove(key: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq("key", key)
      .eq("user_id", user.id);
    if (error) console.error(`Error removing ${key} from Supabase:`, error);
  }

  /**
   * Sync LocalStorage to Supabase (Initial Migration)
   */
  static async syncFromLocal(password: string, localData: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(localData)) {
      await this.set(key, value, password);
    }
  }

  /**
   * List all keys for the current user
   */
  static async listKeys(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("key")
        .eq("user_id", user.id);

      if (error || !data) return [];
      return data.map((d) => d.key);
    } catch (error) {
      console.error("Error listing keys from Supabase:", error);
      return [];
    }
  }

  /**
   * Verify if the master password is correct using a test key
   */
  static async verifyMasterPassword(password: string): Promise<boolean> {
    const key = "vault_check";
    const existing = await this.get<string>(key, password);
    
    if (existing === "ok") return true;
    
    // If no vault_check exists, this might be a new setup or first migration
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from(this.TABLE_NAME)
      .select("key")
      .eq("key", key)
      .eq("user_id", user.id)
      .single();

    if (!data) {
      // Create the check for future verifications
      await this.set(key, "ok", password);
      return true;
    }

    // If data exists but decryption failed (existing was null), password is wrong
    return false;
  }
}
