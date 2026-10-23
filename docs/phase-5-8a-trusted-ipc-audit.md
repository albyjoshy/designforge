# DesignForge AI — Phase 5.8A Trusted IPC Feasibility Audit

Date: 2026-10-23

## Verdict

**BLOCKED.** The current Node/MCP deployment does not provide a demonstrated,
independently authenticated identity for the approval host process. The apply
tool and production writes remain disabled.

This is an investigation result, not an authorization to change the write
path.

## Current trust boundary

```text
Browser review UI
  untrusted local client; receives review metadata only
          |
          v
Approval host / issuer
  owns durable issuer key and review state; records human decision
          |
          ?  <-- missing independently authenticated host-to-MCP channel
          v
MCP server
  receives untrusted tool requests; currently cannot redeem approval
          |
          v
Transaction engine
  guarded host-side disposable tests only; unreachable from normal apply MCP calls
          |
          v
Flutter project
  untrusted files; canonical paths, snapshots and protected-file policy required
```

The current MCP transport is `StdioServerTransport`. The approval host is a
loopback HTTP server with CSRF and origin checks, but loopback, an opaque URL,
or a bearer token authenticates possession of a value—not the identity of the
MCP process. The approval host's HMAC key is not available to MCP arguments or
tool responses. The disabled apply handler rejects requests before transaction
invocation.

## Runtime evidence

- Node.js: `v24.19.0`
- npm: `11.17.0`
- MCP server transport: stdio
- Repository dependencies: no Windows IPC/native process-identity package
- Existing documented investigation: `docs/phase-5-5e-windows-ipc-capability.md`
- Current application status: `designforge_apply_approved_ui` disabled; production writes disabled

## Architecture options

### Option A — native Windows named-pipe authority

Windows named pipes support ACLs and server-side client impersonation. Microsoft
documents that a pipe DACL controls access, and that
`ImpersonateNamedPipeClient` obtains the client's security context. Windows also
provides `GetNamedPipeClientProcessId`, which returns a client PID.

However, ACLs restricted to the same interactive user do not distinguish the
intended MCP process from another process running as that user. A PID is not a
cryptographic process identity and can be reused. Impersonation proves a token
security context, normally user/session identity; it does not by itself prove
that the peer is the intended signed MCP executable. A native broker would need
to verify the client PID while the handle is live, inspect its token and image,
bind the request to an authenticated launch relationship or protected service
identity, and define failure behavior for replacement/race cases.

Result in this repository: **BLOCKED / not implemented**. Node's stable `net`
API exposes Windows named pipes, but it does not expose the required Windows
security-descriptor, impersonation, client-process-token, or executable-identity
verification contract for this server.

### Option B — dedicated broker or Windows service

A broker/service could own the issuer key and redemption database. The MCP
server would authenticate to it through a native channel, use a challenge bound
to the process launch/session, and receive a narrowly scoped one-time result.
Running the broker under a distinct service identity or protected service SID
would provide a stronger boundary than same-user IPC.

Trade-offs: requires a signed/native component or service installation,
explicit ACL/SID provisioning, key storage and rotation, crash recovery,
deployment lifecycle, and an independently testable client-identity mechanism.
None is present or authorized in the current repository/runtime. A shared
secret in an environment variable, URL, MCP argument, or config file would not
meet the threat model.

Result: **POTENTIALLY VIABLE, but BLOCKED pending native broker and deployment
proof**.

### Option C — keep application disabled

This is the smallest defensible current design. The host may issue and validate
its own approvals, while MCP remains unable to redeem them or invoke the
transaction engine. It preserves fail-closed behavior and adds no unverified
trust channel.

Result: **SELECTED**.

## Platform evidence and limitations

Microsoft documents that named-pipe ACLs can restrict access and that
`ImpersonateNamedPipeClient` changes the server thread to the client's security
context. Microsoft also documents `GetNamedPipeClientProcessId` as returning a
client process identifier. These are useful primitives, but they do not alone
establish executable identity against a same-user impostor.

Node documents that Windows IPC paths in `node:net` are implemented as named
pipes. The Node API documents connectivity and pipe lifetime, not the Windows
security descriptor, impersonation, process-token, or signed-executable
verification needed here.

Sources:

- [Microsoft: Named Pipe Security and Access Rights](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights)
- [Microsoft: Impersonating a Named Pipe Client](https://learn.microsoft.com/en-us/windows/win32/ipc/impersonating-a-named-pipe-client)
- [Microsoft: GetNamedPipeClientProcessId](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-getnamedpipeclientprocessid)
- [Node.js: IPC support in `node:net`](https://nodejs.org/api/net.html#ipc-support)

## Protocol required before implementation

Any future authority must implement a protocol similar to:

1. MCP connects through a native authenticated channel; the authority verifies
   the OS-level client identity before accepting requests.
2. Authority issues a fresh random challenge bound to the authenticated peer,
   authority instance, protocol version and expiry.
3. MCP returns the challenge with an exact canonical request containing approval
   ID, proposal hash, canonical project root, complete file set, source hashes,
   diff hash and impact binding.
4. Authority validates authoritative durable state, expiry, revocation and
   exact binding, then atomically transitions `APPROVED -> REDEEMED`.
5. The result is short-lived, scoped to one operation, and cannot expose the
   issuer key. Redemption state is durable before any mutation.
6. MCP revalidates source state and protected paths immediately before calling
   the existing transaction layer. Crash recovery must never make a redeemed
   approval reusable.

## Threat model and negative tests

The implementation gate must include separate-process tests for:

- unauthorized same-user client and malformed IPC frames;
- forged, stale, expired, revoked and incorrectly signed evidence;
- replay after success, authority restart and crash at each transition;
- cross-project, changed proposal, changed file set and stale source snapshot;
- concurrent redemption, proving at most one success;
- PID reuse or client replacement before mutation;
- pipe ACL changes, remote/session boundary attempts and unexpected origins;
- symlink, junction, reparse-point and TOCTOU path substitutions;
- transaction interruption, backup recovery and rollback conflicts;
- absence of key material or corrupted authority state;
- logs and responses containing no keys, bearer values or raw approval artifacts.

No such authenticated IPC tests were claimed as executed in this phase.

## Explicit implementation prerequisites

Before reconsidering Option A or B, provide:

- a reviewed native Windows component or service with documented security
  descriptors and process/client identity verification;
- a deployment model that prevents same-user arbitrary clients from being
  accepted as MCP;
- durable key storage, rotation and revocation procedures;
- a real separate-process test harness with crash and replay coverage;
- independent review of the native boundary and transaction handoff;
- no changes to the 21 MCP schemas and no production-write enablement during
  the proof of concept.

## Status matrix

| Item | Status |
|---|---|
| Existing 21 MCP tools preserved | PASS |
| Read-only workflow | PASS per prior audit |
| Native authenticated host-to-MCP IPC demonstrated | BLOCKED |
| Secure one-time redemption through MCP | BLOCKED |
| `designforge_apply_approved_ui` | DISABLED |
| Production writes | DISABLED |
| Human approval | PENDING |
| Phase 6 | NOT STARTED |
