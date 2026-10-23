# DesignForge AI — Phase 5.8B Native Approval Broker Feasibility

Date: 2026-10-23

## Verdict

**BLOCKED.** A separately reviewed native Windows broker could become a
defensible future authority, but this repository and runtime do not currently
provide or demonstrate the native component, protected identity, deployment
model, or independent process tests required to authenticate the intended MCP
executable. Option C remains active.

- `designforge_apply_approved_ui`: disabled
- Application writes: disabled
- Production writes: disabled
- Human approval: not simulated
- Phase 6: not started

## Existing architecture and trust assumptions

The browser is an untrusted local UI client. The local approval host owns the
issuer secret and durable review state. The MCP server receives untrusted tool
requests over stdio and cannot currently redeem host-issued approvals. The
transaction layer is guarded and is not reachable through the normal apply MCP
handler. Flutter projects remain untrusted inputs requiring canonical path,
snapshot, protected-file and rollback checks.

The threat model includes another process running as the same Windows user,
process replacement, a malicious or replaced executable, stale/replayed
messages, local endpoint discovery, compromised project files, and crashes at
every approval and transaction boundary. We do not assume that a PID, process
name, user identity, environment variable, pipe name, loopback connection, or
shared secret proves the intended MCP executable.

## Candidate native designs

### A. Native named-pipe broker in the interactive user session

The broker would create a named pipe with an explicit DACL, obtain the client
PID, inspect the client token and image, and use client impersonation for the
authorization check. It would own approval keys and the redemption database.

Advantages:

- Native Windows access checks and pipe lifetime.
- Can reject clients outside the intended logon/session boundary.
- Can support challenge binding and atomic redemption in one authority.

Limitations and residual risk:

- A same-user ACL does not distinguish an MCP impostor.
- A PID can be reused and is not an executable attestation.
- Process image/path checks are race-sensitive and do not prove the loaded code
  is unmodified.
- Client impersonation authenticates a Windows security context; it is not
  proof of a particular signed executable.
- Node's standard IPC API does not expose the needed native security and token
  operations.
- A native helper or reviewed addon, secure installation, ACL provisioning,
  update policy and independent security review are required.

Status: **BLOCKED pending native implementation and proof**.

### B. Broker installed as a Windows service with a distinct service identity

The broker would run under a dedicated service account or service SID, keep the
issuer key in protected storage, and expose a pipe whose DACL admits only the
intended service/client principals. The MCP process would need a documented,
independently verifiable launch relationship or a separate client identity—not
merely the same interactive user.

Advantages:

- Stronger separation than an interactive same-user broker.
- Stable authority lifecycle and durable state ownership.
- Suitable location for key rotation, revocation and crash recovery.

Limitations and residual risk:

- Installing a service does not automatically authenticate the MCP client.
- A client certificate, signed executable, or shared secret alone does not
  establish that the connecting process is the intended live process.
- Requires native service code, secure provisioning, update/rollback controls,
  service ACL review and a test threat model for administrators and same-user
  attackers.
- Service compromise becomes a high-impact approval boundary.

Status: **POTENTIALLY VIABLE, but not selectable in the current deployment**.

### C. Keep application disabled

This is the current design. The host can maintain its own approval state, but
MCP cannot convert an untrusted request into a redemption or file mutation.

Status: **SELECTED**.

## Recommended future architecture

Option B is the stronger candidate for a future proof of concept, provided a
native service identity and independently authenticated client channel can be
demonstrated. The minimum protocol is:

1. The broker authenticates the client through a native mechanism before
   accepting approval operations; ordinary pipe connectivity is insufficient.
2. It issues a fresh challenge bound to broker instance, authenticated peer,
   protocol version and short expiry.
3. The MCP client submits a canonical request containing approval ID, nonce,
   proposal hash, canonical project root, exact file set, source snapshot,
   diff hash, impact assessment and expiry.
4. The broker validates authoritative state and atomically changes
   `APPROVED -> REDEEMED` using durable storage before returning a scoped result.
5. The MCP side revalidates paths, source hashes and protected behavior
   immediately before the existing transaction layer.
6. Crashes after redemption fail closed; recovery may continue only when a
   durable transaction journal proves the exact operation and ownership.

This recommendation is architectural only. It is not implemented or approved
for writes.

## Key management and recovery requirements

- Generate issuer keys inside the authority; never accept caller-supplied keys.
- Store keys using a protected Windows credential/key-storage mechanism or a
  dedicated service account with restrictive ACLs.
- Persist issuer identity across restart; missing or changed key material fails
  closed and never silently creates a replacement identity.
- Bind approvals to exact canonical data: root, sorted file set, proposal and
  diff hashes, source hashes, impact summary, expiry and unique nonce.
- Persist approval state and redemption atomically; use durable replay markers.
- Support explicit revocation and key rotation with an auditable transition.
- Never place secrets in URLs, browser content, MCP arguments, logs or error
  responses.
- Define recovery for crashes before redemption, after redemption, during
  transaction staging, during atomic replacement and after commit.
- Rollback must verify after-hashes and preserve unrelated concurrent changes.

## Independent evidence required

### Node-only tests

Node can test canonical serialization, signatures, expiry, revocation, exact
binding, durable state transitions, concurrency, crash journals, path policy,
PNG/artifact validation and rollback conflict logic. These tests cannot prove
Windows process identity or native ACL behavior.

### Native and multi-process tests

A reviewed Windows component must test, with real separate processes:

- unauthorized same-user client and malformed IPC messages;
- broker/client executable replacement and process termination/replacement;
- pipe DACL and session boundary enforcement;
- client-token, process-image and launch-relationship verification;
- forged, expired, revoked, replayed and duplicate nonce requests;
- cross-project, changed-file-set, changed-proposal and stale-source attacks;
- concurrent redemption with at most one success;
- broker restart and key/session-store corruption;
- crashes before redemption, after redemption, during apply and after commit;
- interrupted writes, backup integrity and rollback conflicts;
- remote endpoint, stale endpoint and unauthorized invocation attempts;
- secret/key/artifact redaction from logs and responses.

Tests must record observed exit codes and evidence. Unexecuted native tests are
`PENDING` or `BLOCKED`, never PASS.

## Unresolved blockers

1. No native broker or service exists in the repository.
2. No independently provisioned client identity distinguishes MCP from a
   same-user impostor.
3. Node's current IPC surface does not expose the required Windows security
   operations.
4. No documented key-provisioning, service-installation or update lifecycle is
   available.
5. Separate-process approval recovery and authenticated redemption remain
   unproven.

## Validation performed for this phase

Repository inspection completed for the Phase 5.8A/5.5D/5.5E documents, the
approval issuer, local host, session store, transaction engine, MCP apply
handler and Phase 5 security test inventory. No implementation code was
changed. No human approval was created. No production project was accessed.

The existing 21 tool names and schemas were not modified. The apply handler
remains a forced rejection and does not invoke the transaction engine. Full
regression execution was not repeated in this documentation-only feasibility
phase; prior results remain evidence from the preceding audits, not new test
execution here.
