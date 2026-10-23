# DesignForge AI — Phase 5.8C Security Architecture Decision Record

Date: 2026-10-23

## Decision

**BLOCKED — retain Option C.** DesignForge will continue operating in its
read-only/artifact-generating mode. No trusted application-write handoff is
approved because the current runtime cannot independently authenticate the
intended MCP executable to the approval authority.

The following remain disabled:

- `designforge_apply_approved_ui`
- application writes
- production writes
- human approval simulation

Phase 6 has not started.

## Decision context and threat model

The browser is an untrusted local client. The approval host owns review state
and issuer key material. The MCP server currently uses stdio and is not an
authenticated peer of the approval host. The transaction engine is guarded and
not reachable through ordinary MCP apply requests. Flutter source, paths,
comments, links, snapshots, and proposed diffs are untrusted inputs.

The assumed attacker may run another process as the same Windows user, discover
or replace a local endpoint, replay or alter messages, substitute executables,
modify project files between checks, race concurrent requests, or terminate a
broker during approval or transaction processing. A PID, process name, shared
user identity, named-pipe connectivity, environment variable, bearer value, or
undocumented Codex pipe is not treated as executable identity.

## Option comparison

### Option 1 — current read-only operation

Trust boundary: no MCP-to-issuer redemption exists. Planning, scanning,
proposal artifacts, screenshot comparison, and verification can run without
authorizing target mutation. The apply handler rejects requests before the
transaction engine.

Security properties:

- Strongest currently demonstrated boundary because no untrusted MCP request
  can become a write authorization.
- No cross-process signing-key exposure, replay handoff, or redemption race.
- Existing artifact, path, protected-file, approval, and rollback tests remain
  useful for isolated disposable host-side behavior.

Limitations:

- Cannot complete MCP-mediated UI application.
- Human approval cannot be consumed by MCP.
- Does not prove production write safety because writes are unavailable.

Operational cost is low and evidence is reproducible. Independent evidence
required to leave this option is a separately authenticated authority channel,
durable approval redemption, crash recovery, and native security testing.

Decision: **SELECTED**.

### Option 2 — separately installed native Windows broker/service

Trust boundary: a broker owns issuer keys and durable redemption state. A
native channel, preferably attached to a protected service identity, would
authenticate the MCP client before accepting a redemption request.

Potential protections:

- Service identity and restrictive ACLs can separate the authority from the
  interactive browser and ordinary user processes.
- Native pipe security can enforce principal/session access and client
  impersonation can expose the client's Windows security context.
- Durable broker state can atomically enforce expiry, revocation, nonce
  uniqueness, replay protection, and crash recovery.

What these controls do not prove:

- A named pipe proves connectivity and ACL authorization, not the intended
  executable by itself.
- A PID can be reused; a process name or path can be substituted.
- User-token identity does not prove that loaded MCP code is unmodified.
- A signed executable or hash check requires protected installation, update
  policy, race-resistant verification, and a defined trust root.

Required deployment and maintenance:

- Reviewed native broker/service and secure installation location.
- Explicit service SID/account, DACL/SACL and session policy.
- Protected key provisioning, rotation, revocation, backup and recovery.
- Signed update channel with rollback and executable-integrity policy.
- Separate-process tests against same-user impostors and replacement races.
- Independent review of the native boundary and transaction handoff.

Residual risks include broker compromise, privileged service abuse, installer or
update compromise, administrator-level attackers, native TOCTOU gaps, and
incorrect recovery after a crash. The broker must fail closed whenever peer
identity, key state, source snapshot, or transaction journal is uncertain.

Decision: **POTENTIALLY VIABLE, NOT READY**.

### Option 3 — external authorization/signing service

Trust boundary: a separately managed authorization service owns signing keys
and approval state. The local MCP/approval host would authenticate to it using a
documented client identity, such as a managed certificate or platform identity,
and request a narrowly scoped one-time redemption.

Potential protections:

- Key material and redemption state can be isolated from the local MCP process.
- Centralized audit, revocation, rotation, concurrency control and recovery may
  be stronger than local ad hoc state.
- Mutual authentication can be based on a documented service identity rather
  than a local bearer token.

Costs and risks:

- Introduces network availability, endpoint discovery, TLS trust, account
  provisioning, service compromise, privacy and operational dependencies.
- A client certificate stored on the same machine may still be usable by a
  same-user attacker unless protected by hardware/platform key controls and
  process authorization.
- Remote approval service availability cannot be allowed to create stale or
  duplicate local applications.
- Requires a separate security review, paid/operational infrastructure policy,
  data-boundary review, incident response, and offline/recovery design.

Decision: **POTENTIALLY VIABLE, NOT READY**. No external service was selected,
provisioned, contacted, or used in this phase.

## Cross-option approval requirements

Any future write-enabled design must bind each approval to canonical project
root, proposal and diff hashes, complete changed-file set, source snapshot
hashes, impact assessment, expiry, issuer identity, protocol version, fresh
challenge and unique nonce. The authority must atomically transition
`APPROVED -> REDEEMED` before returning authorization and persist that state
durably.

The transaction layer must revalidate canonical paths, link/reparse state,
protected files, source hashes and unexpected changes immediately before
mutation. Crashes before redemption, after redemption, during staging, during
replacement, and after commit need explicit journal recovery rules. Rollback
must verify after-hashes and preserve unrelated changes.

Secrets must never appear in browser content, URLs, MCP arguments, tool
responses, logs or error messages. Missing keys, corrupted state, unknown
issuer, stale challenge, replay, concurrent redemption, failed peer identity,
or ambiguous transaction ownership must fail closed.

## Required independent evidence before reconsideration

1. Native or external peer authentication demonstrated against a same-user
   malicious client—not merely a successful connection.
2. Executable installation/integrity and update protections tested under
   replacement and restart scenarios.
3. Durable issuer-key loading with explicit rotation, revocation and recovery.
4. Separate-process approval recovery, concurrent one-time redemption and
   crash-boundary tests.
5. Cross-project, changed-file-set, stale-snapshot, traversal, reparse-point,
   rollback-conflict and interrupted-write tests.
6. Independent review of the authority, IPC/client-authentication boundary,
   and transaction integration.
7. Full MCP regression proving all 21 names and schemas remain compatible.

Node-only tests can cover canonical data, signatures, replay, expiry, durable
state, path policy, and rollback. They cannot establish Windows executable
identity or native ACL semantics. Native and multi-process claims must remain
`PENDING` or `BLOCKED` until actually observed.

## Validation performed

Repository documents and implementation boundaries were inspected. Then the
following commands were executed without changing implementation code:

```powershell
cd "D:\New folder\designforge-ai\mcp-server"
npm.cmd run typecheck
npm.cmd test
```

Observed results:

- TypeScript typecheck: PASS
- TypeScript build within `npm.cmd test`: PASS
- MCP regression: PASS — 4/4 tests
- All 21 tool registration/invocation coverage: PASS
- Native broker tests: NOT RUN — no broker exists
- Human approval: NOT SIMULATED

No production project was accessed. No MCP schema or tool name was changed.

## Final safety status

The read-only fallback remains the only selected architecture. Application and
production writes remain disabled, the apply tool remains forcibly rejected,
and Phase 6 has not started.
