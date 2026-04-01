import CryptoJS from 'crypto-js';

// Hardcoded secret key for frontend encryption.
// We use a fallback if the env variable is missing to ensure it never breaks.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'mangareader-anti-tamper-key-9988C';

/**
 * A custom storage wrapper for Zustand (or manual usage) that encrypts the JSON
 * payload before saving it to localStorage, preventing users from casually editing
 * their stats or achievements to cheat.
 */
export const secureStorage = {
  getItem: (name) => {
    try {
      const encryptedValue = localStorage.getItem(name);
      if (!encryptedValue) return null;

      // Attempt to decrypt the payload
      const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      // If decrypted string is empty, it usually signifies a wrong key or manipulated string
      if (!decryptedString) {
        throw new Error('Data corruption or tampering detected (empty decryption).');
      }
      
      return JSON.parse(decryptedString);
    } catch (error) {
      console.warn(`[secureStorage] Integrity check failed for '${name}'. Resetting tampered data.`);
      // Nuke the storage key to penalize the tampering attempt
      localStorage.removeItem(name);
      return null;
    }
  },
  
  setItem: (name, value) => {
    try {
      const stringValue = JSON.stringify(value);
      const encryptedValue = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
      localStorage.setItem(name, encryptedValue);
    } catch (error) {
      console.error(`[secureStorage] Failed to encrypt data for '${name}':`, error);
    }
  },
  
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};
