import { spawn } from 'node:child_process';
import { realpath, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { readPng } from './png.js';

export const allowedViewports = new Map([[360, 800], [430, 932], [768, 1024], [1024, 768], [1440, 900]]);
const fixture = resolve(process.cwd(), 'tests', 'fixtures', 'phase5_flutter');
const outputRoot = resolve(process.cwd(), '.designforge-artifacts', 'phase5_flutter');
const timeoutMs = 45_000;
const inside = (p: string, root: string) => p === root || p.startsWith(root + sep);

async function runViewport(name: string, width: number, height: number, runId: string) {
  if (!allowedViewports.has(width) || allowedViewports.get(width) !== height) throw new Error('Unsupported viewport');
  const dart = process.env.DESIGNFORGE_FLUTTER_DART ?? 'C:/src/flutter/bin/cache/dart-sdk/bin/dart.exe';
  const snapshot = process.env.DESIGNFORGE_FLUTTER_SNAPSHOT ?? 'C:/src/flutter/bin/cache/flutter_tools.snapshot';
  const child = spawn(dart, [snapshot, 'test', 'test/capture_adapter_test.dart', '--no-pub'], { cwd: fixture, env: { ...process.env, CI: 'true', FLUTTER_SUPPRESS_ANALYTICS: 'true', FLUTTER_CONFIG_DIR: resolve(outputRoot, '.flutter-config'), DESIGNFORGE_CAPTURE_ROOT: outputRoot, DESIGNFORGE_CAPTURE_STREAM: '1', DESIGNFORGE_CAPTURE_VIEWPORT: name }, windowsHide: true });
  let stdout = '', stderr = ''; child.stdout.on('data', b => { if (stdout.length < 1_000_000) stdout += b; }); child.stderr.on('data', b => { if (stderr.length < 1_000_000) stderr += b; });
  const code = await new Promise<number>((ok, fail) => { const t = setTimeout(() => { child.kill(); fail(new Error(`Flutter capture timed out after ${timeoutMs}ms`)); }, timeoutMs); child.once('error', fail); child.once('close', c => { clearTimeout(t); ok(c ?? -1); }); });
  if (code !== 0) throw new Error(`Flutter capture exited ${code}: ${stderr.slice(0, 1800)} ... ${stderr.slice(-1800)}`);
  const line = stdout.split(/\r?\n/).map(x => x.trim()).filter(x => x.startsWith('{') && x.includes('pngBase64')).pop();
  if (!line) throw new Error(`Flutter capture produced no PNG payload: ${stderr.slice(-1000)}`);
  const payload = JSON.parse(line) as { pngBase64?: string; width?: number; height?: number };
  if (payload.width !== width || payload.height !== height || !payload.pngBase64) throw new Error('Capture payload dimensions or bytes are invalid');
  const filename = `capture_mcp_${runId}_${name}.png`;
  const writer = spawn(process.execPath, [resolve(process.cwd(), 'scripts', 'capture-artifact-writer.mjs')], { cwd: process.cwd(), env: { ...process.env, DESIGNFORGE_CAPTURE_ROOT: outputRoot }, windowsHide: true });
  let out = '', err = ''; writer.stdout.on('data', b => out += b); writer.stderr.on('data', b => err += b); writer.stdin.end(JSON.stringify({ filename, pngBase64: payload.pngBase64 }));
  const writerCode = await new Promise<number>((ok, fail) => { const t = setTimeout(() => { writer.kill(); fail(new Error('Artifact writer timed out')); }, 10_000); writer.once('error', fail); writer.once('close', c => { clearTimeout(t); ok(c ?? -1); }); });
  if (writerCode !== 0) throw new Error(`Artifact writer exited ${writerCode}: ${err.slice(-500)}`);
  const result = JSON.parse(out) as { path: string; width: number; height: number; bytes: number; sha256: string; persisted: boolean };
  const canonical = await realpath(result.path); if (!inside(canonical, outputRoot) || result.width !== width || result.height !== height || !result.persisted) throw new Error('Artifact confinement or persistence validation failed');
  const image = await readPng(canonical); const info = await stat(canonical); if (image.width !== width || image.height !== height || info.size <= 0) throw new Error('Persisted PNG validation failed');
  return { viewport: name, path: canonical, width, height, bytes: info.size, sha256: result.sha256, status: 'PASS' };
}

export async function renderResponsive(projectRoot: string, viewports: { name: string; width: number; height: number }[]) {
  const canonical = await realpath(projectRoot), expected = await realpath(fixture);
  if (canonical.toLowerCase() !== expected.toLowerCase()) throw new Error('Responsive renderer is restricted to the disposable phase5 fixture');
  const results = []; for (const v of viewports) results.push(await runViewport(v.name, v.width, v.height, `${Date.now().toString(16)}-${process.pid.toString(16)}`)); return results;
}
