import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('scanner rejects symbolic-link entries instead of following them', async (t) => {
  const root=await mkdtemp(join(tmpdir(),'designforge-link-')); await mkdir(join(root,'lib')); await writeFile(join(root,'outside.dart'),'name: outside');
  try { await symlink(join(root,'outside.dart'),join(root,'lib','linked.dart')); } catch { await rm(root,{recursive:true,force:true}); t.skip('symbolic-link creation is unavailable in this Windows test environment'); return; }
  const old=process.env.DESIGNFORGE_ALLOWED_ROOTS; process.env.DESIGNFORGE_ALLOWED_ROOTS=root;
  const {readProjectFiles}=await import('../dist/scanner/secure-filesystem.js');
  await assert.rejects(()=>readProjectFiles(root),/symbolic link|reparse/i);
  if(old===undefined)delete process.env.DESIGNFORGE_ALLOWED_ROOTS;else process.env.DESIGNFORGE_ALLOWED_ROOTS=old; await rm(root,{recursive:true,force:true});
});
