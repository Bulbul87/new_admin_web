const base64ToArrayBuffer = (base64:any) => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const arrayBufferToString = (buffer:any) => {
  return new TextDecoder().decode(buffer);
};

export const decryptData = async (ciphertextBase64:any) => {
  try {
    const rawKey = import.meta.env.VITE_AES_SECRET_KEY || "YOUR_KEY_HERE";

    // convert key
    const keyBuffer = new TextEncoder().encode(rawKey.padEnd(32, "0"));

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const data = base64ToArrayBuffer(ciphertextBase64);

    // backend format: IV(12) + AUTH_TAG(16) + DATA
    const iv = data.slice(0, 12);
    const encrypted = data.slice(28);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128,
      },
      cryptoKey,
      encrypted
    );

    return arrayBufferToString(decrypted);
  } catch (error) {
    console.log("Decrypt error:", error);
    return null;
  }
};