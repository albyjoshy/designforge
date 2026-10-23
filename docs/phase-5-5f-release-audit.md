# DesignForge AI — Phase 5.5F Read-Only Release Audit

Date: 2026-10-23

## Verdict

**PARTIAL.** The read-only and artifact-generating DesignForge workflow is validated. Application, trusted handoff, and production-readiness remain blocked by the undocumented authenticated Windows IPC/process-identity capability documented in Phase 5.5E.

## Tool access classification

| MCP tool | Classification | Audit result |
|---|---|---|
| `designforge_get_tokens` | Read-only | PASS |
| `designforge_screen_plan` | Read-only | PASS |
| `designforge_audit_checklist` | Read-only | PASS |
| `designforge_responsive_guidance` | Read-only | PASS |
| `designforge_evaluate_screen` | Read-only | PASS |
| `designforge_component_recommendations` | Read-only | PASS |
| `designforge_flutter_theme_guidance` | Read-only | PASS |
| `designforge_scan_project` | Read-only project inspection | PASS |
| `designforge_discover_screens` | Read-only project inspection | PASS |
| `designforge_analyze_routes` | Read-only project inspection | PASS |
| `designforge_extract_theme` | Read-only project inspection | PASS |
| `designforge_audit_responsive` | Read-only project inspection | PASS |
| `designforge_project_report` | Read-only project inspection/report | PASS |
| `designforge_ui_change_plan` | Read-only analysis; artifact generation | PASS |
| `designforge_generate_ui_proposal` | Artifact-generating; does not edit target files | PASS |
| `designforge_preview_ui` | Read-only contract; blocked when no renderer exists | PASS / BLOCKED result is fail-closed |
| `designforge_compare_screenshots` | Read-only artifact analysis | PASS |
| `designforge_responsive_test` | Read-only analysis; renderer-dependent checks blocked | PASS / BLOCKED result is fail-closed |
| `designforge_change_impact` | Read-only analysis | PASS |
| `designforge_apply_approved_ui` | File-writing capability; forcibly disabled | PASS — rejects |
| `designforge_verify_ui_change` | Read-only verification; write-dependent checks blocked | PASS / BLOCKED result is fail-closed |

No MCP tool outside the guarded host-side disposable tests writes application files.

## Apply-path audit

The registered apply handler returns `REJECTED` with the limitation that no trusted approval channel is available. It does not invoke the transaction engine. Therefore normal, malformed, replayed, forged, expired, mismatched, or failure-path tool calls cannot write files through MCP.

Host-side transaction tests remain separate and are limited to temporary disposable roots. They cover protected paths, traversal, source conflicts, rollback conflicts, approval replay, and guarded disposable application. This does not authorize MCP writes.

## Security findings

PASS:

- Canonical/protected-path checks remain active.
- Approval issuer rejects forged, expired, revoked, mismatched, and replayed evidence.
- Local host remains loopback- and CSRF-protected.
- Review content is HTML-escaped.
- Signing secrets are not returned to MCP clients or browser content.
- Artifact and screenshot paths remain bounded.
- Rollback checks after-hashes and preserves conflicts.
- Production-root writes remain disabled.

BLOCKED:

- Authenticated host-to-MCP process handoff.
- Separate OS-process recovery proof with persistent issuer-key configuration.
- End-to-end write-dependent Flutter validation.
- Production application readiness.
- Git status, due to `spawn EPERM`.

## Commands executed

```powershell
cd "D:\New folder\designforge-ai\mcp-server"
npm.cmd run typecheck
npm.cmd run build
node --test tests/tools.test.js tests/protocol.test.js tests/phase5-verification.test.js tests/phase5-2-security.test.js tests/phase5-4-host.test.js
```

Results:

- Typecheck: PASS
- Build: PASS
- Regression suite: PASS — 13 tests passed, 0 failed
- All 21 MCP tools: PASS through protocol coverage
- PNG comparison tests: PASS
- Approval/security tests: PASS
- Transaction/rollback tests: PASS

## Explicit limitations

- Read-only/static analysis is not visual inspection.
- Preview and responsive renderer-dependent checks report BLOCKED when no renderer output exists.
- No production project was accessed.
- No Flutter fixture was modified during this audit.
- No golden baseline was updated.
- A passing read-only audit does not prove business-logic preservation under an applied UI patch.

## Release status

The reusable read-only DesignForge workflow is suitable for continued controlled use. The complete UI application workflow is not release-ready. Keep `designforge_apply_approved_ui` disabled until a documented, independently authenticated Windows IPC/process-identity mechanism is available and separately tested.
