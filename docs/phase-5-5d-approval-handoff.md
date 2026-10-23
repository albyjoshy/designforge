# DesignForge AI — Phase 5.5D Approval Handoff Decision

Date: 2026-10-23

## Decision

**Option C — keep `designforge_apply_approved_ui` disabled.**

The current Windows/Codex deployment does not expose a documented, independently authenticated channel from the MCP server process to the local approval host. Loopback binding, an opaque review URL, a bearer token, or a caller-supplied secret would not authenticate the requesting process. Enabling the apply path with any of those mechanisms would weaken the existing approval boundary.

This is a deliberate fail-closed decision, not a claim that the approval UI or HMAC issuer is insecure in isolation.

## Design comparison

### Option A — dedicated local redemption service

This is the preferred future architecture. The authority would own the durable signing key and expose a narrowly scoped redemption endpoint over authenticated Windows IPC. The MCP process would submit a server-side approval reference and exact request binding; the authority would atomically redeem it and return a short-lived result.

Current blocker: the repository has no authenticated MCP-process identity or documented Windows named-pipe ACL/impersonation integration. A loopback HTTP endpoint would be reachable by any local process and would not prove caller identity. A shared bearer secret would recreate the rejected MCP-argument problem.

### Option B — shared durable authority

This would centralize issuance and redemption state and could support atomic transitions, key rotation, and restart recovery. It has the same unresolved process-authentication problem and adds operational complexity without a trustworthy identity primitive available in this deployment.

### Option C — disabled apply path

This preserves the current security invariant: only the host can issue and validate approvals, and no MCP caller can convert an untrusted argument into authorization. It is the smallest defensible choice until authenticated IPC is available and tested.

## Trust boundaries

- Browser: untrusted UI client; receives review metadata only, never signing keys or approval signatures.
- Approval host: trusted issuer boundary; owns the durable issuer key and review-session state.
- MCP server: untrusted caller relative to the issuer; may plan, inspect, compare, and verify, but cannot redeem or apply.
- Transaction engine: guarded mutation boundary; remains reachable only through host-side disposable tests.
- Target project: untrusted source; paths, comments, hashes, links, and source state are revalidated.

## Required future prerequisite

Before enabling the apply tool, implement and independently test one of:

1. A Windows named-pipe authority with restrictive ACLs and verified server-side client identity/impersonation, or
2. A Codex/runtime-provided authenticated local-channel capability documented by the host and unavailable to arbitrary local clients.

The channel must support durable key loading, atomic one-time redemption, revocation, expiry, crash recovery, and exact proposal/source binding. The authority must never return its signing key or accept a caller-generated signature as consent.

## Crash and replay policy

Until that authority exists, no MCP redemption occurs. Existing host-side approval tests continue to enforce expiry, tamper rejection, replay protection, and disposable transaction rollback. A future authority must atomically transition `APPROVED -> REDEEMED` before mutation, persist the transaction outcome, and make post-crash recovery fail closed unless the journal proves the exact transaction was committed.

## Current validation

- TypeScript typecheck: PASS
- TypeScript build: PASS
- Regression suite: PASS — 13/13
- All 21 MCP tools: PASS
- Separate authenticated OS-process handoff: BLOCKED
- `designforge_apply_approved_ui`: DISABLED
- Production writes: DISABLED
- Genuine human approval: PENDING
- Git verification: BLOCKED by `spawn EPERM`

No Flutter project was modified while this decision was made.
