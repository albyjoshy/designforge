import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, join, resolve, sep } from 'node:path';
import { readPng } from '../dist/phase5/png.js';

const root = resolve(process.env.DESIGNFORGE_CAPTURE_ROOT ?? '');
const approved = resolve(process.cwd(), '.designforge-artifacts', 'phase5_flutter');
if (!root || root.toLowerCase() !== approved.toLowerCase()) throw new Error('invalid capture root');
mkdirSync(root, { recursive: true });

const input = JSON.parse(readFileSync(0, 'utf8'));
const match = /^capture_[0-9a-f-]+_(360x800|430x932|768x1024|1024x768|1440x900)\.png$/.exec(input.filename);
if (!match || !input.pngBase64) throw new Error('invalid capture payload');
const [width, height] = match[1].split('x').map(Number);
const bytes = Buffer.from(input.pngBase64, 'base64');
if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024) throw new Error('invalid PNG size');
if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('invalid PNG signature');
const destination = resolve(root, basename(input.filename));
if (!(destination === root || destination.startsWith(root + sep)) || existsSync(destination)) throw new Error('unsafe or colliding destination');
const image = await readPngFromBytes(bytes);
if (image.width !== width || image.height !== height) throw new Error('PNG dimensions do not match viewport');
const temp = `${destination}.tmp-${process.pid}`;
writeFileSync(temp, bytes, { flag: 'wx' });
try { renameSync(temp, destination); } catch (error) { try { unlinkSync(temp); } catch {} throw error; }
const persisted = readFileSync(destination);
const hash = createHash('sha256').update(persisted).digest('hex');
process.stdout.write(JSON.stringify({ path: destination, width, height, bytes: persisted.length, sha256: hash, persisted: persisted.equals(bytes) }));

async function readPngFromBytes(buffer) {
  const temp = join(root, `.capture-validate-${process.pid}.png`);
  writeFileSync(temp, buffer, { flag: 'wx' });
  try { return await readPng(temp); } finally { unlinkSync(temp); }
}
