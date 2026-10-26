import crypto from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const file = process.env.DESIGNFORGE_TOKEN_FILE ?? './data/pinterest-token.enc';
const key = process.env.DESIGNFORGE_TOKEN_ENCRYPTION_KEY ? Buffer.from(process.env.DESIGNFORGE_TOKEN_ENCRYPTION_KEY, 'hex') : null;

export async function loadToken() {
  if (!key || key.length !== 32) return '';
  try {
    const payload = JSON.parse(await readFile(file, 'utf8'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]).toString('utf8'));
  } catch { return ''; }
}

export async function saveToken(token) {
  if (!key || key.length !== 32) return false;
  const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(token), 'utf8'), cipher.final()]);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify({ version: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') }), { encoding: 'utf8', mode: 0o600 });
  return true;
}
