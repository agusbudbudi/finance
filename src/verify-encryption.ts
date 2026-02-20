// This is a test script to be run in the browser console or during development
import { EncryptionService } from "./src/services/storage/encryptionService";

async function verifyEncryption() {
  const password = "test-password-123";
  const originalData = JSON.stringify({
    balance: 1000000,
    transactions: [1, 2, 3],
    secretNote: "This is a secret"
  });

  console.log("Original Data:", originalData);

  // 1. Encrypt
  const encrypted = await EncryptionService.encrypt(originalData, password);
  console.log("Encrypted Object:", encrypted);

  // 2. Decrypt with correct password
  const decrypted = await EncryptionService.decrypt(encrypted, password);
  console.log("Decrypted Data:", decrypted);

  if (originalData === decrypted) {
    console.log("✅ Verification Success: Data is consistent.");
  } else {
    console.error("❌ Verification Failed: Data mismatch.");
  }

  // 3. Try decrypt with WRONG password
  try {
    await EncryptionService.decrypt(encrypted, "wrong-password");
    console.error("❌ Security Failure: Decrypted with wrong password!");
  } catch (e) {
    console.log("✅ Security Success: Failed to decrypt with wrong password.");
  }
}

// verifyEncryption();
