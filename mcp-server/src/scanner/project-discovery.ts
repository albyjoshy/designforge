import { authorizedRoot, readProjectFiles } from './secure-filesystem.js';
import type { ScanContext } from './types.js';
export async function scanProject(projectPath: string): Promise<ScanContext> {
  const root = await authorizedRoot(projectPath); const files = await readProjectFiles(root); const pubspec = files.find(f => f.relativePath === 'pubspec.yaml');
  if (!pubspec) throw new Error('Not a Flutter project: pubspec.yaml was not found');
  const sdk = pubspec.content.match(/sdk:\s*['"]?([^'"\n]+)|flutter:\s*\n(?:.|\n)*?sdk:\s*['"]?([^'"\n]+)/)?.[1] ?? pubspec.content.match(/environment:\s*\n(?:.|\n)*?sdk:\s*([^\n]+)/)?.[1]?.trim();
  const dependencies = [...pubspec.content.matchAll(/^  ([A-Za-z0-9_]+):/gm)].map(m => m[1]).filter(x => x !== 'sdk');
  const supportedPlatforms = ['android','ios','windows','macos','linux','web'].filter(p => files.some(f => f.relativePath.startsWith(`${p}/`)));
  return { root, files, pubspec, metadata: { projectName: pubspec.content.match(/^name:\s*(.+)$/m)?.[1]?.trim(), flutterSdkConstraint: sdk, dependencies, supportedPlatforms, fileCount: files.length } };
}
