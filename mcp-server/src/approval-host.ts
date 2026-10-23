import { startApprovalHost } from './phase5/local-approval-host.js';
const host=await startApprovalHost();
console.error(`DesignForge approval host listening on http://127.0.0.1:${host.port}`);
console.error('This process does not issue approvals until a prevalidated review session is created by the local workflow.');
await new Promise<void>(()=>{});
