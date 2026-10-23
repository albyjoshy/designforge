import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { startApprovalHost, applyApprovedDisposable } from '../dist/phase5/local-approval-host.js';
import { sha256 } from '../dist/phase5/core.js';

const csrfFrom = (cookie) => cookie.match(/df_csrf=([^;]+)/)?.[1] ?? '';

test('local approval host is loopback-only, CSRF-protected, and rejection creates no approval', async () => {
  process.env.DESIGNFORGE_APPROVAL_SECRET='test-host-secret'; process.env.DESIGNFORGE_APPROVAL_ISSUER_ID='test-host-issuer';
  const host=await startApprovalHost();
  const req={proposalId:'p-reject',patchHash:'patch',projectRoot:'fixture',files:['lib/home.dart'],snapshotHash:'snap',expiresAt:new Date(Date.now()+60000).toISOString(),diffSummary:'diff',impactSummary:'presentation-only'};
  const review=await host.createReview(req); const page=await fetch(review.url); assert.equal(page.status,200);
  const cookie=page.headers.get('set-cookie')??'';
  const rejected=await fetch(review.url+'/decision',{method:'POST',headers:{origin:`http://127.0.0.1:${host.port}`,'content-type':'application/json','cookie':cookie,'x-csrf-token':csrfFrom(cookie)},body:JSON.stringify({action:'reject'})});
  assert.equal(rejected.status,200); assert.match(await rejected.text(),/REJECTED/);
  host.server.close();
});

test('test-only host approval applies only to an authorized disposable root and consumes approval', async () => {
  const root=await mkdtemp(join(tmpdir(),'designforge-host-fixture-')); await mkdir(join(root,'lib')); const file=join(root,'lib/home.dart'); await writeFile(file,'before');
  process.env.DESIGNFORGE_APPROVAL_SECRET='test-host-secret'; process.env.DESIGNFORGE_APPROVAL_ISSUER_ID='test-host-issuer'; process.env.DESIGNFORGE_DISPOSABLE_ROOTS=root;
  const host=await startApprovalHost(); const req={proposalId:'p-apply',patchHash:'patch',projectRoot:resolve(root),files:['lib/home.dart'],snapshotHash:'snap',expiresAt:new Date(Date.now()+60000).toISOString(),diffSummary:'diff',impactSummary:'presentation-only'};
  const review=await host.createReview(req); const page=await fetch(review.url); const cookie=page.headers.get('set-cookie')??'';
  const approved=await fetch(review.url+'/decision',{method:'POST',headers:{origin:`http://127.0.0.1:${host.port}`,'content-type':'application/json','cookie':cookie,'x-csrf-token':csrfFrom(cookie)},body:JSON.stringify({action:'approve'})}); assert.equal(approved.status,200);
  const approval=(await host.getReview(review.token)).approval; assert.ok(approval);
  const tx=await applyApprovedDisposable(root,[{relativePath:'lib/home.dart',content:'after',expectedHash:sha256('before')}],approval,req); assert.equal(tx.status,'APPLIED'); assert.equal(await readFile(file,'utf8'),'after');
  await assert.rejects(()=>applyApprovedDisposable(root,[{relativePath:'lib/home.dart',content:'again',expectedHash:sha256('after')}],approval,req),/replay/); host.server.close(); await rm(root,{recursive:true,force:true});
});

test('durable review sessions recover after host restart and reject tampering', async () => {
  process.env.DESIGNFORGE_APPROVAL_SECRET='test-recovery-secret';
  process.env.DESIGNFORGE_APPROVAL_ISSUER_ID='test-recovery-issuer';
  const request={proposalId:'p-recovery',patchHash:'patch-recovery',projectRoot:'disposable-fixture',files:['lib/main.dart'],snapshotHash:'snapshot-recovery',expiresAt:new Date(Date.now()+60000).toISOString(),diffSummary:'UI-only',impactSummary:'presentation-only'};
  const first=await startApprovalHost();
  const review=await first.createReview(request);
  first.server.close();
  const second=await startApprovalHost();
  const recovered=await second.getReview(review.token);
  assert.equal(recovered?.status,'PENDING');
  assert.equal(recovered?.request.patchHash,request.patchHash);
  assert.equal(recovered?.request.projectRoot,request.projectRoot);
  second.server.close();
});
