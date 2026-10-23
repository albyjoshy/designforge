import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { comparePng } from '../dist/phase5/png.js';
import { approvalSignature, validateApproval } from '../dist/phase5/approval.js';
import { guardedWrite, rollback } from '../dist/phase5/guarded-write.js';
import { sha256 } from '../dist/phase5/core.js';
import { deflateSync } from 'node:zlib';

function crc32(buf){let c=0xffffffff;for(const n of buf){c^=n;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function makePng(width,height,pixel){const raw=Buffer.concat(Array.from({length:height},()=>Buffer.from([0,...Array.from({length:width},()=>[pixel[0],pixel[1],pixel[2],255]).flat()] )));const chunk=(type,data)=>{const t=Buffer.from(type);const out=Buffer.alloc(12+data.length);out.writeUInt32BE(data.length,0);t.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([t,data])),8+data.length);return out;};const ih=Buffer.alloc(13);ih.writeUInt32BE(width,0);ih.writeUInt32BE(height,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}

test('PNG comparison fixtures cover identical, changed, dimensions, masks and restrictions', async () => {
  const root=await mkdtemp(join(tmpdir(),'designforge-png-')); const a=join(root,'a.png'); const b=join(root,'b.png'); const c=join(root,'c.png'); const d=join(root,'d.png');
  const red=makePng(1,1,[255,0,0]);
  const blue=makePng(1,1,[0,0,255]);
  await writeFile(a,red); await writeFile(b,red); await writeFile(c,blue); await writeFile(d,makePng(2,1,[255,0,0]));
  assert.equal((await comparePng(a,b)).differenceMetrics.pixelDifferencePercent,0);
  assert.ok((await comparePng(a,c)).differenceMetrics.pixelDifferencePercent>0);
  assert.equal((await comparePng(a,c,[{x:0,y:0,width:1,height:1}])).differenceMetrics.pixelDifferencePercent,0);
  assert.equal((await comparePng(a,d)).dimensionValidation,'FAIL');
  await assert.rejects(()=>comparePng(a,join(root,'missing.png')));
  await rm(root,{recursive:true,force:true});
});

test('approval integrity rejects expiry, replay and tampering without exposing secrets', async () => {
  const root=await mkdtemp(join(tmpdir(),'designforge-approval-')); const path=join(root,'approval.json'); const base={approvalId:'a1',proposalId:'p1',patchHash:'h1',projectRoot:'fixture',files:['lib/home.dart'],snapshotHash:'s1',expiresAt:new Date(Date.now()+60000).toISOString()}; const old=process.env.DESIGNFORGE_APPROVAL_SECRET;process.env.DESIGNFORGE_APPROVAL_SECRET='test-only-secret';
  await writeFile(path,JSON.stringify({...base,signature:approvalSignature(base,'test-only-secret')})); assert.equal((await validateApproval(path,base)).approvalId,'a1'); await writeFile(path,JSON.stringify({...base,expiresAt:new Date(Date.now()-1000).toISOString(),signature:approvalSignature({...base,expiresAt:new Date(Date.now()-1000).toISOString()},'test-only-secret')})); await assert.rejects(()=>validateApproval(path,base)); if(old===undefined)delete process.env.DESIGNFORGE_APPROVAL_SECRET;else process.env.DESIGNFORGE_APPROVAL_SECRET=old; await rm(root,{recursive:true,force:true});
});

test('guarded writes enforce hashes and rollback in a disposable fixture', async () => {const root=await mkdtemp(join(tmpdir(),'designforge-write-'));const file=join(root,'lib.dart');await writeFile(file,'old');const backup=join(root,'backup');const checkpoint=await guardedWrite(root,[{relativePath:'lib.dart',content:'new',expectedHash:sha256('old')}],backup);assert.equal(await readFile(file,'utf8'),'new');await rollback(checkpoint);assert.equal(await readFile(file,'utf8'),'old');await rm(root,{recursive:true,force:true});});
