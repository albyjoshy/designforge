import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type DesignTokens = Record<string, unknown> & { version: string; breakpoints: { compactMax: number; mediumMax: number; expandedMin: number } };
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export function loadDesignTokens(): DesignTokens {
  return JSON.parse(readFileSync(resolve(repositoryRoot, 'design-system/tokens.json'), 'utf8')) as DesignTokens;
}
