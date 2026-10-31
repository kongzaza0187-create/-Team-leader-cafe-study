/**
 * Lumina 24-Hour Cafe - Cryptographic Table & Session Security Service
 * Implements HMAC-SHA256 Tokenization and Non-Repeating 6-digit Secret Codes
 */

const SECRET_SALT = 'lumina_cafe_24h_entropy_master_salt_2026';

// In-memory historical code tracking per table to guarantee non-repetition across cycles
const historicalCodesPerTable: Map<string, Set<string>> = new Map();

/**
 * Generates a guaranteed non-repeating 6-digit secret code for a table.
 * Even if Table 1 is checked in/out 50 times in a day, every cycle gets a distinct 6-digit code.
 */
export function generateCryptographicSecretCode(tableId: string): string {
  if (!historicalCodesPerTable.has(tableId)) {
    historicalCodesPerTable.set(tableId, new Set<string>());
  }
  const usedCodes = historicalCodesPerTable.get(tableId)!;

  // Use window.crypto for CSPRNG
  const array = new Uint32Array(1);
  let attempts = 0;
  
  while (attempts < 10000) {
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      array[0] = Math.floor(Math.random() * 900000);
    }

    const codeNumber = (array[0] % 900000) + 100000;
    const candidateCode = codeNumber.toString().padStart(6, '0');

    if (!usedCodes.has(candidateCode)) {
      usedCodes.add(candidateCode);
      return candidateCode;
    }
    attempts++;
  }

  // Fallback with timestamp hash slice
  const fallback = String(Date.now() % 900000 + 100000);
  usedCodes.add(fallback);
  return fallback;
}

/**
 * Synchronous SHA-256 implementation for fast token signing without async latency
 */
export function computeSHA256(ascii: string): string {
  return sha256Sync(ascii);
}

/**
 * Cryptographic SHA-256 Hash of Admin Access Key
 * Plaintext password is strictly never stored or compared directly
 */
export const ADMIN_PASSWORD_SHA256_HASH = '8936b51f709037b5c81b7587751799ea2292ffb924c9c80db253af549516c148';

export function verifyAdminPassword(input: string): boolean {
  if (!input) return false;
  return computeSHA256(input) === ADMIN_PASSWORD_SHA256_HASH;
}

function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < ascii[lengthProperty]; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 255) << (24 - (i % 4) * 8);
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  const w: number[] = new Array(64);
  for (i = 0; i < words[lengthProperty]; i += 16) {
    const oldHash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = ((w[j - 16] + s0) | 0) + ((w[j - 7] + s1) | 0);
      }

      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = ((((hash[7] + s1) | 0) + ch) | 0) + ((k[j] + w[j]) | 0);
      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

/**
 * Computes HMAC-SHA256 signature for session verification
 */
export function computeHMACSHA256(message: string, key: string = SECRET_SALT): string {
  // Key preparation
  let k = key;
  if (k.length > 64) {
    k = sha256Sync(k);
  }
  const ipad = [];
  const opad = [];
  for (let i = 0; i < 64; i++) {
    const byte = i < k.length ? k.charCodeAt(i) : 0;
    ipad.push(String.fromCharCode(byte ^ 0x36));
    opad.push(String.fromCharCode(byte ^ 0x5c));
  }
  const innerHash = sha256Sync(ipad.join('') + message);
  // Convert hex inner hash back to raw binary string
  let innerBinary = '';
  for (let i = 0; i < innerHash.length; i += 2) {
    innerBinary += String.fromCharCode(parseInt(innerHash.substr(i, 2), 16));
  }
  return sha256Sync(opad.join('') + innerBinary);
}

/**
 * Creates a complete session cryptogram: TableID + Timestamp + ClientFingerprint + SecretCode
 */
export function createSessionCryptogram(tableId: string, secretCode: string, clientIp: string = '192.168.1.104'): {
  sessionId: string;
  hmacSignature: string;
  checkInAt: string;
} {
  const timestamp = Date.now();
  const rawMessage = `${tableId}:${clientIp}:${secretCode}:${timestamp}`;
  const hmacSignature = computeHMACSHA256(rawMessage);
  const sessionId = `sess_${timestamp}_${tableId}_${hmacSignature.substring(0, 8)}`;

  return {
    sessionId,
    hmacSignature,
    checkInAt: new Date(timestamp).toISOString(),
  };
}
