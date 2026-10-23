import { mkdir, readFile, writeFile, rename, realpath, lstat } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { sha256, protectedFile } from './core.js';
import type { TransactionJournal } from './transaction.js';

function inside(root:string, path:string){return path===root||path.startsWith(root+sep);}
export async function secureWriteTransaction(root:string, files:{relativePath:string;content:string;expectedHash:string}[], backupRoot:string):Promise<TransactionJournal>{
  const canonicalRoot=await realpath(resolve(root)); const tx:TransactionJournal={transactionId:randomUUID(),root:canonicalRoot,status:'APPLIED',entries:[]}; await mkdir(backupRoot,{recursive:true});
  for(const f of files){if(protectedFile(f.relativePath))throw new Error('Protected transaction file');const full=resolve(canonicalRoot,f.relativePath);if(!inside(canonicalRoot,full))throw new Error('Traversal outside transaction root');const parent=await realpath(dirname(full));if(!inside(canonicalRoot,parent))throw new Error('Symlink or junction escaped transaction root');const beforeStat=await lstat(full);if(!beforeStat.isFile()||beforeStat.isSymbolicLink())throw new Error('Unexpected target identity');const before=await readFile(full,'utf8');if(sha256(before)!==f.expectedHash)throw new Error(`Source conflict: ${f.relativePath}`);const parentAgain=await realpath(dirname(full));const afterStat=await lstat(full);if(!inside(canonicalRoot,parentAgain)||!afterStat.isFile()||afterStat.isSymbolicLink())throw new Error('Target changed during validation');const backup=resolve(backupRoot,f.relativePath);await mkdir(dirname(backup),{recursive:true});await writeFile(backup,before,'utf8');const temp=`${full}.${tx.transactionId}.tmp`;await writeFile(temp,f.content,'utf8');await rename(temp,full);tx.entries.push({relativePath:f.relativePath,beforeHash:sha256(before),afterHash:sha256(f.content),backupPath:backup});}
  return tx;
}
