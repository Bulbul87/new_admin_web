import CryptoJS from "crypto-js";

const AES_KEY ="4dd8596692f2d0eb0cb28e18ae21624d0c287dbfcf97fe1c017ab310bb91ab71";

export const decryptData = (encryptedText) => {
  try {
    if (!encryptedText) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedText, AES_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted || null;
  } catch (error) {
    console.log("Decryption failed:", error);
    return null;
  }
};