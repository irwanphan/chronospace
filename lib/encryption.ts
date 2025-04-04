import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

// Convert base64 key to buffer or generate random key
const KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'base64')
  : randomBytes(32); // 32 bytes for AES-256

export async function encrypt(text: string): Promise<string> {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // Combine IV, salt, tag and encrypted data
  const result = Buffer.concat([
    iv,
    salt,
    tag,
    encrypted
  ]);

  return result.toString('base64');
}

export async function decrypt(encryptedText: string): Promise<string> {
  const buffer = Buffer.from(encryptedText, 'base64');

  const iv = buffer.subarray(0, IV_LENGTH);
  const salt = buffer.subarray(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
  const tag = buffer.subarray(IV_LENGTH + SALT_LENGTH, IV_LENGTH + SALT_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + SALT_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
} 