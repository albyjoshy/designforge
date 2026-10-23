# DesignForge AI — Phase 5.5E Windows IPC Capability Investigation

Date: 2026-10-23

## Verdict

**BLOCKED.** No defensible authenticated host-to-MCP process channel was demonstrated in the current Windows/Codex runtime. The apply tool remains disabled.

## Observed runtime

- Windows PowerShell execution environment
- Node.js: `v24.19.0`
- npm: `11.17.0`
- Codex version: `0.163.0-alpha.11`
- MCP transport: `StdioServerTransport` from `@modelcontextprotocol/sdk`
- MCP server launch: `node dist/index.js` over standard input/output
- Repository dependencies contain no Windows IPC or native process-identity package
- Codex exposed an internal environment variable named `CODEX_APP_TOOLS_PIPE_PATH`, but its ownership, ACL contract, protocol, and client identity guarantees are undocumented for DesignForge and it is not the MCP transport.

## Candidate evaluation

### Windows named pipes

Node can create named pipes, but a pipe connection by itself authenticates only possession of the pipe name and any configured transport secret. It does not prove that the peer is the intended MCP process. Windows ACLs can restrict users or security principals, but the current repository has no verified named-pipe security descriptor, impersonation check, executable identity validation, or deployment contract. An ACL restricted to the same user would still allow another process running as that user to impersonate MCP.

Result: **BLOCKED** for the required threat model.

### Dedicated broker process

A broker could own keys and redemption state, but it still requires an authenticated client identity. No documented broker or trusted parent-provided capability is available to this MCP server. A shared environment secret or bearer token would not establish process identity and would violate the handoff requirements.

Result: **BLOCKED**.

### Windows access tokens / native APIs

The available environment inspection showed multiple Codex and Node processes in the same Windows session. User/session identity alone cannot distinguish the intended MCP process from another process running as the same user. No native token impersonation or executable-signature verification integration exists in the repository, and no such check was demonstrated.

Result: **BLOCKED**.

### Existing Codex internal pipe

The environment exposes `CODEX_APP_TOOLS_PIPE_PATH`, but querying its ACL through PowerShell returned Windows error 87, and its protocol and peer-authentication semantics are not documented for DesignForge. Treating that pipe as an authorization channel would be an undocumented integration and could not prove the connecting process identity.

Result: **NOT USABLE / BLOCKED**.

## Proof-of-concept result

No IPC proof of concept was implemented because no candidate met the minimum identity requirement. Implementing a loopback or named-pipe bearer-token demo would demonstrate connectivity, not authenticated process identity, and would create misleading security evidence.

## Security decision

Option C from Phase 5.5D remains in force:

- `designforge_apply_approved_ui`: disabled
- Production writes: disabled
- Disposable Flutter fixture: unchanged
- No human approval was created or simulated
- No signing keys or credentials were exposed

## Required future capability

Integration can resume only when the deployment provides one of the following and it is independently testable:

1. A Windows named-pipe authority with restrictive ACLs plus verified server-side client identity/impersonation that distinguishes the MCP process from same-user impostors; or
2. A documented Codex/runtime authenticated local-channel API that exposes peer identity and supports durable, atomic approval redemption.

That capability must be combined with durable issuer-key loading, atomic redemption, replay protection, crash recovery, exact proposal/source binding, and the existing path/transaction safeguards.

## Commands and evidence

Observed commands:

```powershell
node --version
npm.cmd --version
Get-Acl \\.\pipe\<Codex internal pipe>
Get-Process node,codex
Get-CimInstance Win32_Process
```

The repository MCP server uses stdio transport, not a peer-authenticated socket or pipe. Existing DesignForge validation remains 13/13 regression tests, with typecheck, build, and all 21 tools passing before this investigation.
