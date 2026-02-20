/**
 * EncryptionService
 * Handles client-side encryption/decryption using AES-GCM (Web Crypto API).
 */

export class EncryptionService {
  private static ALGORITHM = "AES-GCM";
  private static KEY_LENGTH = 256;
  private static ITERATIONS = 100000;

  /**
   * Derive a cryptographic key from a password and salt.
   */
  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations: this.ITERATIONS,
        hash: "SHA-256",
      } as Pbkdf2Params,
      baseKey,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypt data
   */
  static async encrypt(data: string, password: string): Promise<{ ciphertext: string; iv: string; salt: string }> {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);

    const encoder = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv: iv as BufferSource },
      key,
      encoder.encode(data)
    );

    return {
      ciphertext: this.bufToHex(encrypted),
      iv: this.bufToHex(iv),
      salt: this.bufToHex(salt),
    };
  }

  /**
   * Decrypt data
   */
  static async decrypt(
    encryptedData: { ciphertext: string; iv: string; salt: string },
    password: string
  ): Promise<string> {
    const salt = this.hexToBuf(encryptedData.salt);
    const iv = this.hexToBuf(encryptedData.iv);
    const ciphertext = this.hexToBuf(encryptedData.ciphertext);
    const key = await this.deriveKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private static bufToHex(buffer: ArrayBuffer | Uint8Array): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private static hexToBuf(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }
}
