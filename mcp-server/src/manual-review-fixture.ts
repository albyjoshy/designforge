import { createHash, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { startApprovalHost } from './phase5/local-approval-host.js';
import { canonicalize } from './phase5/canonical.js';

process.env.DESIGNFORGE_APPROVAL_SECRET ??= randomBytes(32).toString('hex');
process.env.DESIGNFORGE_APPROVAL_ISSUER_ID ??= 'designforge-local-manual-review';
const projectRoot=resolve('tests/fixtures/phase5_flutter');
const relativePath='lib/main.dart';
const source=await readFile(join(projectRoot,relativePath),'utf8');
const snapshotHash=createHash('sha256').update(source).digest('hex');
const request={proposalId:'phase5-5a-disposable-ui-review',patchHash:createHash('sha256').update(canonicalize({projectRoot,files:[relativePath],change:'UI-only dashboard presentation proposal'})).digest('hex'),projectRoot,files:[relativePath],snapshotHash,expiresAt:new Date(Date.now()+15*60*1000).toISOString(),diffSummary:'UI-only dashboard presentation change; no route, state, API, persistence, auth or business-logic changes.',impactSummary:'Presentation-only disposable fixture change; protected behavior review required before any application.'};
const host=await startApprovalHost();
const review=await host.createReview(request);
console.log(JSON.stringify({url:review.url,proposalHash:request.patchHash,projectRoot,files:request.files,expiresAt:request.expiresAt},null,2));
await new Promise<void>(()=>{});
