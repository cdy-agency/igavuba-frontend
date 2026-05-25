let cachedPublicKey: CryptoKey | null = null;

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function pemToArrayBuffer(base64Pem: string): ArrayBuffer {
  const pem = atob(base64Pem);
  const pemLines = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
  return base64ToArrayBuffer(pemLines);
}

async function importPublicKey(): Promise<CryptoKey> {
  if (cachedPublicKey) return cachedPublicKey;

  const base64Key = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;
  if (!base64Key) throw new Error('NEXT_PUBLIC_RSA_PUBLIC_KEY not configured');

  const keyBuffer = pemToArrayBuffer(base64Key);
  cachedPublicKey = await crypto.subtle.importKey(
    'spki',
    keyBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );
  return cachedPublicKey;
}

async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function encryptPayload(data: unknown): Promise<{
  encryptedKey: string;
  encryptedData: string;
  iv: string;
  tag: string;
  aesKey: CryptoKey;
}> {
  const publicKey = await importPublicKey();
  const aesKey = await generateAESKey();

  // Export and encrypt AES key with RSA
  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
  const encryptedKeyBuffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAesKey,
  );

  // Encrypt payload with AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    aesKey,
    plaintext,
  );

  // AES-GCM appends the auth tag to the ciphertext — split them
  const encrypted = new Uint8Array(ciphertext);
  const encData = encrypted.slice(0, encrypted.length - 16);
  const tag = encrypted.slice(encrypted.length - 16);

  return {
    encryptedKey: arrayBufferToBase64(encryptedKeyBuffer),
    encryptedData: arrayBufferToBase64(encData.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    tag: arrayBufferToBase64(tag.buffer),
    aesKey,
  };
}

export async function encryptAESKeyOnly(): Promise<{ encryptedKey: string; aesKey: CryptoKey }> {
  const publicKey = await importPublicKey();
  const aesKey = await generateAESKey();
  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
  const encryptedKeyBuffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAesKey,
  );
  return { encryptedKey: arrayBufferToBase64(encryptedKeyBuffer), aesKey };
}

export async function decryptResponse(
  aesKey: CryptoKey,
  response: { encryptedData: string; iv: string; tag: string },
): Promise<unknown> {
  const iv = base64ToArrayBuffer(response.iv);
  const encData = new Uint8Array(base64ToArrayBuffer(response.encryptedData));
  const tag = new Uint8Array(base64ToArrayBuffer(response.tag));

  // Reassemble ciphertext + tag for Web Crypto API
  const combined = new Uint8Array(encData.length + tag.length);
  combined.set(encData);
  combined.set(tag, encData.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv), tagLength: 128 },
    aesKey,
    combined,
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}
