import crypto from 'node:crypto';

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'fallback-encryption-key-32-chars!!';
const ALGORITHM = 'aes-256-cbc';

// キーを32バイトに調整
function getKey(): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
  if (key.length === 32) {
    return key;
  }
  if (key.length > 32) {
    return key.subarray(0, 32);
  }
  // 32バイトに満たない場合はパディング
  const padded = Buffer.alloc(32);
  key.copy(padded);
  return padded;
}

/**
 * OpenAI APIキーを暗号化します
 */
export function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, getKey());

  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * 暗号化されたOpenAI APIキーを復号化します
 */
export function decryptApiKey(encryptedApiKey: string): string | null {
  try {
    const [ivHex, encrypted] = encryptedApiKey.split(':');

    if (!ivHex || !encrypted) {
      return null;
    }

    const decipher = crypto.createDecipher(ALGORITHM, getKey());

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('APIキーの復号化に失敗しました:', error);
    return null;
  }
}

/**
 * APIキーの先頭と末尾だけを表示用にマスクします
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '***';
  }

  const start = apiKey.substring(0, 7);
  const end = apiKey.substring(apiKey.length - 4);
  return `${start}...${end}`;
}
