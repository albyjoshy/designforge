# DesignForge AI — Phase 5.11 End-to-End Read-Only Validation

Date: 2026-10-23

## Verdict

**PASS for the disposable read-only workflow; BLOCKED for renderer-dependent
responsive execution and trusted application writes.**

The workflow was exercised against:

`D:\New folder\designforge-ai\mcp-server\tests\fixtures\phase5_flutter`

No Flutter application source or golden baseline was modified.

## Workflow executed

The dedicated test
`mcp-server/tests/phase5-e2e-readonly.test.js` executed this sequence through
the MCP server:

1. Scan disposable Flutter project.
2. Create a UI change plan.
3. Generate an isolated proposal artifact.
4. Verify the proposal artifact hash against the exact serialized bytes on disk.
5. Run deterministic impact analysis.
6. Compare the persisted 360×800 candidate and dashboard golden using the PNG
   comparison tool.
7. Run responsive validation; renderer-dependent result was correctly reported
   as `BLOCKED` with a test matrix.
8. Submit an untrusted apply request; the handler returned `REJECTED`.
9. Recheck source and golden hashes after the workflow.

The proposal target list contained `lib/main.dart`; impact output was exactly
`['lib/main.dart']`, with no duplicates and stable ordering.

## Validation executed

```powershell
cd "D:\New folder\designforge-ai\mcp-server"
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
npm.cmd run build
node --test tests/phase5-e2e-readonly.test.js tests/phase5-verification.test.js tests/phase5-2-security.test.js tests/phase5-4-host.test.js tests/phase5-readonly-safety.test.js
```

Results:

- TypeScript typecheck: PASS
- TypeScript build: PASS
- Standard MCP suite: PASS — 5/5
- End-to-end disposable/security/artifact suite: PASS — 11/11
- All 21 tool names and schemas: PASS
- Proposal hash consistency: PASS
- Impact determinism: PASS
- PNG comparison execution: PASS
- Responsive renderer execution: BLOCKED and reported as blocked
- Apply-handler rejection: PASS
- Transaction invocation from normal apply request: not reached
- Fixture source/golden integrity: PASS

The test used existing persisted candidate artifacts from Phase 5.7E for the
PNG comparison. It did not regenerate goldens or claim new visual acceptance.

## Integrity evidence

The E2E test recorded SHA-256 hashes for `lib/main.dart` and all five dashboard
goldens before the workflow and compared them after completion. The hashes were
identical. Proposal artifact verification recomputed SHA-256 over the exact
bytes read from the artifact path and matched the returned artifact hash.

## Fail-closed behavior

The apply request supplied an untrusted patch hash and approval reference. The
MCP response was `REJECTED` because no trusted approval channel is available.
The registered apply handler returns before the transaction engine, so this
workflow performed no target write.

## Remaining limitations

- Responsive MCP testing reports blocked renderer prerequisites; successful
  static analysis is not a rendered responsive result.
- PNG equality measures pixels but does not establish accessibility or design
  acceptance.
- The host-to-MCP authenticated process identity problem remains unresolved
  under the Phase 5.8 architecture decision.
- Git verification remains blocked where Git cannot launch.
- The read-only E2E flow does not prove production write safety or business
  logic preservation under an applied patch.

## Safety confirmation

- Option C: ACTIVE
- `designforge_apply_approved_ui`: DISABLED and fail-closed
- Application writes: DISABLED
- Production writes: DISABLED
- Human approval: NOT SIMULATED
- Production projects accessed: NONE
- MCP tool names/schemas: unchanged
- Phase 6: NOT STARTED
