import CryptoJS from "crypto-js";

const AES_KEY: string = "your-secret-key-here";

export const decryptData = (encryptedText: string): string | null => {
  try {
    if (!encryptedText) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedText, AES_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted || null;
  } catch (error) {
    console.log("Decryption error:", error);
    return null;
  }
};