import { createHmac, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { artifactRoot } from './core.js';
import { canonicalize } from './canonical.js';
import type { ApprovalRequest, TrustedApproval } from './approval-issuer.js';

export type DurableReview = { tokenHash:string; request:ApprovalRequest; csrfHash:string; status:'PENDING'|'APPROVED'|'REJECTED'; approvalId?:string; approval?:TrustedApproval; expiresAt:string; integrity:string };
const dir=join(artifactRoot,'review-sessions');
const key=()=>process.env.DESIGNFORGE_APPROVAL_SECRET;
function integrity(s:Omit<DurableReview,'integrity'>){const k=key();if(!k)throw new Error('Durable review persistence is disabled');return createHmac('sha256',k).update(canonicalize(s)).digest('hex');}
export function hashToken(value:string){const k=key();if(!k)throw new Error('Durable review persistence is disabled');return createHmac('sha256',k).update(value).digest('hex');}
export async function persistReview(s:Omit<DurableReview,'integrity'>|DurableReview){await mkdir(dir,{recursive:true});const {integrity: _ignored, ...body}=s as DurableReview;const full={...body,integrity:integrity(body)};await writeFile(join(dir,`${body.tokenHash}.json`),JSON.stringify(full),'utf8');return full;}
export async function recoverReview(token:string){const tokenHash=hashToken(token);let raw:string;try{raw=await readFile(join(dir,`${tokenHash}.json`),'utf8')}catch{return null;}const s=JSON.parse(raw) as DurableReview;const {integrity:given,...body}=s;if(integrity(body)!==given)throw new Error('Review session integrity failure');if(Date.parse(s.expiresAt)<=Date.now())throw new Error('Review session expired');if(s.tokenHash!==tokenHash)throw new Error('Review token mismatch');return s;}
export async function markReview(s:DurableReview, status:DurableReview['status'], approval?:TrustedApproval){return persistReview({...s,status,approvalId:approval?.approvalId??s.approvalId,approval:approval??s.approval});}
