import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, rm, stat } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { protectedFile, sha256 } from './core.js';

export type WriteSpec = { relativePath: string; content: string; expectedHash: string };
export type Checkpoint = { root: string; files: Record<string, string>; backupDir: string };
function inside(root:string,file:string){const full=resolve(root,file);return full===root||full.startsWith(root+sep);}
export async function guardedWrite(root:string,specs:WriteSpec[],backupDir:string):Promise<Checkpoint>{const canonical=resolve(root);const files:Record<string,string>={};await mkdir(backupDir,{recursive:true});for(const s of specs){if(!inside(canonical,s.relativePath)||protectedFile(s.relativePath))throw new Error('Unauthorized or protected write');const full=resolve(canonical,s.relativePath);const current=await readFile(full,'utf8');if(sha256(current)!==s.expectedHash)throw new Error(`Source hash mismatch: ${s.relativePath}`);files[s.relativePath]=current;await mkdir(dirname(resolve(backupDir,s.relativePath)),{recursive:true});await writeFile(resolve(backupDir,s.relativePath),current,'utf8');}try{for(const s of specs){const full=resolve(canonical,s.relativePath);const temp=`${full}.designforge-tmp`;await writeFile(temp,s.content,'utf8');await rename(temp,full);}return {root:canonical,files,backupDir};}catch(error){await rollback({root:canonical,files,backupDir});throw error;}}
export async function rollback(checkpoint:Checkpoint){for(const [relativePath,content] of Object.entries(checkpoint.files)){const full=resolve(checkpoint.root,relativePath);if(!inside(checkpoint.root,relativePath))throw new Error('Rollback path escaped project root');const current=await readFile(full,'utf8');if(current!==content)await writeFile(full,content,'utf8');}}
