// ===============================
// Base64 → Uint8Array
// ===============================
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

// ===============================
// KEY CONVERSION
// ===============================
const getKeyBuffer = (rawKey: string): ArrayBuffer => {
  const key = rawKey.trim().replace(/^["']|["']$/g, "");

  // HEX KEY
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    const bytes = key.match(/.{2}/g)!.map((b) => parseInt(b, 16));
    return new Uint8Array(bytes).buffer;
  }

  // BASE64 KEY
  const binary = atob(key);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};

// ===============================
// AES-256-GCM DECRYPT
// ===============================
export const decryptData = async (
  ciphertextBase64: string
): Promise<string | null> => {
  try {
    const rawKey = import.meta.env.VITE_AES_SECRET_KEY;

    console.log("AES KEY:", rawKey);

    if (!rawKey) {
      throw new Error("AES key not found");
    }

    const keyBuffer = getKeyBuffer(rawKey);

    console.log(
      "KEY LENGTH:",
      new Uint8Array(keyBuffer).length
    );

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      {
        name: "AES-GCM",
      },
      false,
      ["decrypt"]
    );

    const data = base64ToUint8Array(ciphertextBase64);

    console.log("Encrypted Length:", data.length);

    // Backend format:
    // IV(12) + AUTH_TAG(16) + CIPHERTEXT

    const iv = data.slice(0, 12);
    const authTag = data.slice(12, 28);
    const ciphertext = data.slice(28);

    // WebCrypto format:
    // CIPHERTEXT + AUTH_TAG

    const combined = new Uint8Array(
      ciphertext.length + authTag.length
    );

    combined.set(ciphertext);
    combined.set(authTag, ciphertext.length);

    const decryptedBuffer =
      await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
          tagLength: 128,
        },
        cryptoKey,
        combined
      );

    const result = new TextDecoder().decode(
      decryptedBuffer
    );

    console.log("DECRYPTED:", result);

    return result;
  } catch (error) {
    console.error("Decrypt error:", error);
    return null;
  }
};