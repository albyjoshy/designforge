# Phase 5.13 — Secure Responsive Renderer Adapter

## Verdict

**PARTIAL / BLOCKED for fresh MCP rendering.** The adapter is implemented with a
fixed, disposable-fixture-only execution contract, but the actual MCP invocation
returned `BLOCKED` because the Flutter tool exited 255 while initializing its
persistent tool state in the Codex process environment. No candidate PNG was
created by the MCP run.

## Boundary

The adapter accepts only the exact repository fixture
`mcp-server/tests/fixtures/phase5_flutter`, the five predefined viewport pairs,
and the repository artifact directory. It uses the fixed Dart executable and
Flutter snapshot (overrideable only by the server's controlled environment, not
by MCP arguments), `--no-pub`, a 45-second child timeout, bounded stdout/stderr,
and cleanup on timeout. PNG bytes are sent to the existing confined host writer,
which validates the signature, dimensions, size, collision status and persisted
hash before the MCP response references the artifact.

The apply tool remains a forced rejection and no transaction code is reachable
through ordinary MCP calls.

## Implementation

Changed files:

- `mcp-server/src/phase5/responsive-renderer.ts` — fixed renderer adapter,
  viewport allowlist, process timeout, stream capture, host-writer handoff and
  PNG validation.
- `mcp-server/src/tools/phase5-tools.ts` — responsive tool now invokes the
  adapter and returns actual artifact references on success, while preserving
  truthful `BLOCKED` results on prerequisite failure.
- `docs/phase-5-13-secure-renderer-adapter.md` — this report.

## Evidence

- TypeScript typecheck: PASS.
- TypeScript build: PASS.
- Actual MCP responsive call for 360×800: BLOCKED; Flutter exited 255 during
  Flutter tool initialization (`persistent_tool_state` / `OnBot`).
- Fresh MCP screenshots: BLOCKED; none were generated.
- Application writes: DISABLED; apply remains fail-closed.
- Production projects: not accessed.
- Human approval: not simulated or requested.

Historical Phase 5.7E PNGs are not counted as fresh captures for this phase.
Existing fixture source and golden files remain protected; no golden-update
command was used.

## Remaining limitation

The adapter boundary is present, but MCP-side Flutter startup is not yet
reproducibly permitted in this Codex runtime. The exact Flutter initialization
failure must be resolved in the execution environment before claiming MCP
responsive PASS. No general shell, arbitrary executable, arbitrary root, or
production write path was introduced.
