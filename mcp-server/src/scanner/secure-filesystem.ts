import { realpath, stat, lstat, readFile, readdir } from 'node:fs/promises';
import { resolve, relative, join, sep } from 'node:path';
import type { ProjectFile } from './types.js';

const MAX_FILES = 5000;
const MAX_FILE_BYTES = 1_000_000;
const MAX_TOTAL_BYTES = 25_000_000;
const allowedRoots = () => (process.env.DESIGNFORGE_ALLOWED_ROOTS ?? process.cwd()).split(';').map(x => resolve(x.trim())).filter(Boolean);
export async function authorizedRoot(input: string) {
  const requested = await realpath(resolve(input));
  const roots = await Promise.all(allowedRoots().map(async root => { try { return await realpath(root); } catch { return null; } }));
  if (!roots.some(root => root && (requested === root || requested.startsWith(root + sep)))) throw new Error('Project path is outside DESIGNFORGE_ALLOWED_ROOTS');
  return requested;
}
export async function readProjectFiles(root: string): Promise<ProjectFile[]> {
  const result: ProjectFile[] = []; let total = 0;
  async function walk(dir: string) {
    if (result.length >= MAX_FILES) throw new Error('Project exceeds the file limit');
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (['.git', '.dart_tool', 'build', '.gradle', 'Pods'].includes(entry.name)) continue;
      const full = join(dir, entry.name); const identity = await lstat(full); if (identity.isSymbolicLink()) throw new Error('Project contains an unsupported symbolic link or reparse point'); const info = await stat(full);
      if (info.isDirectory()) await walk(full);
      else if (info.isFile() && /\.(dart|yaml|yml|json)$/.test(entry.name)) {
        if (info.size > MAX_FILE_BYTES || (total += info.size) > MAX_TOTAL_BYTES) throw new Error('Project exceeds the file-size limit');
        result.push({ relativePath: relative(root, full).replaceAll('\\', '/'), absolutePath: full, content: await readFile(full, 'utf8') });
      }
    }
  }
  await walk(root); return result;
}
