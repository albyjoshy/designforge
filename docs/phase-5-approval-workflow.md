# Phase 5.2 approval workflow

The lifecycle is `DRAFT -> ANALYZED -> PREVIEW_READY -> AWAITING_APPROVAL -> APPROVED -> APPLYING -> APPLIED -> VERIFIED`, with `REJECTED`, `EXPIRED`, `FAILED`, and `ROLLED_BACK` terminal states.

Approval must bind the exact proposal hash, canonical project path, authorized file set, expected source snapshot, expiry, issuer identity, and single-use identity. `issueWithHumanConfirmation` is deliberately a host-side API requiring an explicit confirmation callback; it is not exposed as an MCP argument and does not accept `approved: true` or caller-generated signatures. The issuer secret is read only from the local `DESIGNFORGE_APPROVAL_SECRET` environment and is never serialized into an artifact or response. `DESIGNFORGE_APPROVAL_ISSUER_ID` supports issuer rotation; revocation and consumption state are persisted under the controlled artifact directory.

The MCP apply tool remains disabled by default. Guarded transaction helpers are verified only against disposable fixtures until a trusted Codex confirmation surface and production-root policy are separately approved. Rollback checks the after-hash before restoring a backup, so unrelated changes become conflicts rather than being overwritten.

## Codex integration status

Codex MCP approval prompts are host-side confirmation controls. They are not exposed to this server as a signed approval artifact with a trusted issuer identity. DesignForge therefore treats Codex integration as `BLOCKED` and does not convert a normal approved tool call into an HMAC approval. See `docs/phase-5.3.md` for the decision record.

## Local host procedure

The host must be started locally with a protected issuer secret and an explicit disposable-root allowlist:

```powershell
$env:DESIGNFORGE_APPROVAL_SECRET = '<retrieve from a local secret store; never paste into MCP arguments>'
$env:DESIGNFORGE_APPROVAL_ISSUER_ID = 'designforge-local-issuer-1'
$env:DESIGNFORGE_DISPOSABLE_ROOTS = 'D:\New folder\designforge-ai\mcp-server\tests\fixtures\phase5_flutter'
Set-Location 'D:\New folder\designforge-ai\mcp-server'
node dist/approval-host.js
```

The host must print only its loopback URL. The local workflow creates a prevalidated review session and gives the user its URL. The user must inspect the canonical path, exact files, diff, hashes, impact, protected-file classification, and expiry, then click **Approve exact proposal** or **Reject**. Do not automate the click. Rejection produces no approval artifact. After approval, the disposable-only application adapter validates the one-time artifact and transaction preconditions; the MCP apply tool remains disabled.
# Phase 5.5A durable local review

The local approval host persists only bounded review metadata under the DesignForge artifact directory. Session files are HMAC-integrity protected, expire, bind the canonical project/file set and source snapshot, and never persist the raw review URL token or issuer secret. A restarted host rejects corrupted, expired, or mismatched sessions.

For a disposable fixture, start the host from PowerShell with a locally managed secret:

```powershell
cd "D:\New folder\designforge-ai\mcp-server"
$env:DESIGNFORGE_APPROVAL_SECRET = '<local-secret-from-your-secret-store>'
$env:DESIGNFORGE_APPROVAL_ISSUER_ID = 'designforge-local-manual-review'
$env:DESIGNFORGE_DISPOSABLE_ROOTS = "D:\New folder\designforge-ai\mcp-server\tests\fixtures"
node .\dist\manual-review-fixture.js
```

Open the printed `http://127.0.0.1:<port>/review/<token>` URL. Review the canonical project path, exact file set, proposal hash, source snapshot hash, diff, impact summary, and expiry. Click **Reject** to end the session without an approval artifact, or click **Approve exact proposal** only after independently confirming the disposable fixture and UI-only scope. Never paste secrets or approval artifacts into MCP arguments. This workflow does not authorize production roots; the MCP apply tool remains disabled by default.

The current prepared disposable review URL is supplied in the task report. No approval has been performed and no fixture file has been changed.
