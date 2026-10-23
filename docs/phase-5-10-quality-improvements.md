# DesignForge AI — Phase 5.10 Read-Only Product Quality Improvements

Date: 2026-10-23

## Verdict

**PASS for the scoped read-only quality improvements.** Application and
production writes remain disabled; this is not a production-readiness or
trusted-approval verdict.

## Problems identified and evidence

1. **Artifact hash mismatch risk.** `saveArtifact` wrote pretty-printed JSON
   but calculated the SHA-256 over compact JSON. A consumer verifying the stored
   artifact against the reported hash could fail even when the artifact was
   unchanged. The implementation now serializes once and hashes exactly the
   bytes written.
2. **Nondeterministic impact output.** `impact()` returned caller ordering and
   duplicates. Proposal/impact outputs could therefore vary for equivalent file
   sets. The implementation now deduplicates and lexically sorts changed files.
3. **Filesystem-order-dependent scanner output.** Analyzer evidence and report
   arrays inherited filesystem traversal order. Findings and architecture lists
   now use stable file/rule/line ordering.

These were code-level defects identified by inspection; no target Flutter
project was modified to reproduce them.

## Files changed

- `mcp-server/src/phase5/core.ts`
  - Hashes the exact serialized artifact content.
  - Makes impact file lists deterministic and duplicate-free.
- `mcp-server/src/scanner/analyzers.ts`
  - Sorts evidence and report inputs deterministically.
- `mcp-server/tests/tools.test.js`
  - Adds regression coverage for deterministic impact output.
- `docs/phase-5-10-quality-improvements.md`

No MCP tool names, input schemas, output contracts, approval code, transaction
code, Flutter application source, or golden baselines were changed.

## Validation executed in this phase

Commands:

```powershell
cd "D:\New folder\designforge-ai\mcp-server"
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
npm.cmd run build
node --test tests/phase5-verification.test.js tests/phase5-2-security.test.js tests/phase5-4-host.test.js tests/phase5-readonly-safety.test.js
```

Results:

- TypeScript typecheck: PASS
- TypeScript build: PASS
- Standard MCP suite: PASS — 5/5
- Full scoped security/artifact suite: PASS — 10/10
- 21-tool registration/invocation coverage: PASS
- Approval, transaction, rollback, PNG and filesystem checks: PASS
- Symlink scanner rejection: PASS
- Deterministic impact regression: PASS

Flutter analyzer/tests were not rerun because the changes are limited to
TypeScript read-only analysis and artifact serialization; existing Phase 5.9
Flutter results remain historical evidence.

## Compatibility and safety

The protocol regression continued to discover and invoke all 21 tools. The
apply handler remains a forced `REJECTED` response and is tested before any
transaction invocation. No trusted approval was simulated, no keys or tokens
were provisioned, and no production project was accessed.

## Remaining limitations

- Static analysis is not visual inspection or proof of semantic equivalence.
- Renderer-dependent MCP tools remain blocked when real renderer prerequisites
  are absent.
- PNG comparison metrics do not establish accessibility or design acceptance.
- Authenticated host-to-MCP process identity remains blocked under the Phase
  5.8 architecture decision.
- Git verification remains blocked if the environment cannot launch Git.
- Application and production writes remain disabled.

## Follow-up prerequisites

Any future write-enabled work still requires an independently authenticated
approval authority, durable one-time redemption, crash recovery, native or
external process-identity evidence, and independent security review. Phase 6
has not started.
