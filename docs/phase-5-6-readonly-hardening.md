# DesignForge AI — Phase 5.6 Read-Only Hardening Report

Date: 2026-10-23

## Changes

- `mcp-server/src/scanner/secure-filesystem.ts`: reject symbolic-link entries before traversal instead of following them through `stat()`.
- `mcp-server/src/tools/phase5-tools.ts`: resolve screenshot paths with `realpath()` and reject symlink escapes from the controlled artifact root.
- `mcp-server/tests/phase5-readonly-safety.test.js`: add disposable symbolic-link traversal coverage.

No Flutter fixture or production project was modified.

## Validation

```powershell
cd "D:\New folder\designforge-ai\mcp-server"
npm.cmd run typecheck
npm.cmd run build
node --test tests/tools.test.js tests/protocol.test.js tests/phase5-verification.test.js tests/phase5-2-security.test.js tests/phase5-4-host.test.js tests/phase5-readonly-safety.test.js
```

Results:

- TypeScript typecheck: PASS
- TypeScript build: PASS
- Tests: PASS — 14/14
- All 21 MCP tools: PASS
- PNG comparison tests: PASS
- Approval/security tests: PASS
- Transaction/rollback tests: PASS
- Read-only symbolic-link safety test: PASS

## Read-only boundaries

Planning, scanning, impact analysis, preview contracts, responsive analysis, screenshot comparison, and verification do not write target application files. Proposal generation writes only bounded artifacts. Preview, responsive rendering, and unapplied verification report unavailable prerequisites rather than claiming execution.

`designforge_apply_approved_ui` remains hard-coded to return `REJECTED` because the authenticated host-to-MCP handoff is unavailable. It does not call the transaction engine through normal MCP invocation, malformed arguments, replayed references, or exception paths.

## Remaining limitations

- Authenticated Windows host-to-MCP process identity remains BLOCKED.
- Independent separate-process approval recovery remains unproven.
- Write-dependent Flutter validation remains PENDING.
- Production writes remain DISABLED.
- Git verification remains BLOCKED by `spawn EPERM`.

The new scanner protection rejects symbolic links during traversal. Windows reparse-point and junction behavior still requires platform-specific coverage where the runtime can create and inspect those objects safely; no claim of complete TOCTOU protection is made.

## Verdict

**PASS for read-only hardening; PARTIAL for overall Phase 5.6 readiness.**
