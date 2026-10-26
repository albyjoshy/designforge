import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await copyFile('src/ui.html', 'dist/ui.html');
