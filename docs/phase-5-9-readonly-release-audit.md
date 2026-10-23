# DesignForge AI — Phase 5.9 Read-Only Release Candidate Audit

Date: 2026-10-23

## Overall verdict

**PASS for the audited read-only and artifact-generating release candidate;
BLOCKED for trusted application writes and production readiness.**

The supported workflow can scan authorized projects, generate bounded proposal
artifacts, analyze screenshots, and run static/responsive guidance without
writing application files. The trusted approval handoff remains unavailable,
so `designforge_apply_approved_ui` remains forcibly rejected.

## Capability status

| Capability | Status | Evidence from this audit |
|---|---|---|
| TypeScript typecheck | PASS | `npm.cmd run typecheck`, exit 0 |
| TypeScript build | PASS | `npm.cmd run build`, exit 0 |
| 21-tool registration/invocation | PASS | MCP regression test, 4/4 |
| Approval/security tests | PASS | Dedicated suite, 10/10 |
| Transaction/rollback tests | PASS | Dedicated suite included, 10/10 total |
| PNG comparison and restrictions | PASS | Dedicated suite included, 10/10 total |
| Symlink scanner safety | PASS | Dedicated suite included, 10/10 total |
| Apply tool normal invocation | PASS — rejected | Protocol test confirms rejection |
| Apply transaction reachability | PASS — blocked | Handler returns `REJECTED` before transaction invocation |
| Flutter analyzer | PASS | Direct Flutter snapshot, no issues |
| Flutter widget/golden tests | PASS | 2/2, no baseline updates |
| Fresh artifact generation | PASS historically | Phase 5.7E produced five validated PNGs |
| Trusted host-to-MCP IPC | BLOCKED | No independently authenticated process identity |
| Production application writes | DISABLED | Configuration and handler remain fail-closed |
| Git verification | BLOCKED | `git.exe` cannot launch in this environment |

## Commands executed in this phase

```powershell
cd "D:\New folder\designforge-ai\mcp-server"
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
npm.cmd run build
node --test tests/phase5-verification.test.js tests/phase5-2-security.test.js tests/phase5-4-host.test.js tests/phase5-readonly-safety.test.js
```

Observed results:

- Typecheck: PASS
- Build: PASS
- Standard MCP suite: PASS — 4/4
- Security, approval, transaction, rollback, PNG and filesystem suite: PASS — 10/10
- All 21 tool protocol coverage: PASS

Disposable Flutter fixture checks were also run using the bounded direct
Flutter snapshot (`C:\src\flutter\bin\cache\dart-sdk\bin\dart.exe`):

- `analyze --no-pub`: PASS, no issues found
- `test --no-pub`: PASS, 2/2 tests
- Golden-update flags: not used

## Read-only and artifact safety

Current code and tests confirm:

- Project scanners reject symbolic-link entries instead of following them.
- Screenshot comparison confines both inputs to the controlled artifact root
  and rejects symlink escapes.
- PNG decoding rejects malformed input and enforces supported 8-bit RGBA data.
- Artifact-generated proposals are written to the artifact area, not target
  project files.
- The apply handler returns `REJECTED` with no trusted channel and does not call
  the transaction engine.
- Traversal, protected-file, source-conflict, replay, expiry, tamper and
  rollback-conflict tests passed.
- No golden baseline was updated.

Phase 5.7E historically produced these five fresh disposable artifacts under
the approved artifact directory and compared each to its matching golden:

- 360×800: 0% pixel difference, MAE 0
- 430×932: 0% pixel difference, MAE 0
- 768×1024: 0% pixel difference, MAE 0
- 1024×768: 0% pixel difference, MAE 0
- 1440×900: 0% pixel difference, MAE 0

Those are historical Phase 5.7E results, not newly generated in this audit.

## Fixture and golden integrity

The current hashes match the previously recorded values for the fixture app and
dashboard goldens, including:

- `lib/main.dart`: `6760D6B417DC…`
- `dashboard_360x800.png`: `053D4909A672…`
- `dashboard_430x932.png`: `9DA439CEF7E4…`
- `dashboard_768x1024.png`: `11E878765555…`
- `dashboard_1024x768.png`: `E75D20B8D383…`
- `dashboard_1440x900.png`: `F305C7FB1D44…`

The displayed values are intentionally shortened in this report; the complete
hashes remain in the prior artifact-persistence report and command output.
No production project was accessed or modified.

## Approval-handoff blocker

The Phase 5.8A–5.8C investigations remain unresolved. Loopback HTTP, bearer
tokens, named-pipe connectivity, PIDs, process names, shared-user identity and
undocumented Codex internals do not establish that the connecting process is
the intended MCP executable. A separately reviewed native broker/service or
external authorization boundary would be required, with durable key handling,
atomic one-time redemption, crash recovery, executable/process identity
verification and independent same-user spoofing tests.

Until that evidence exists, MCP cannot redeem host-issued approval artifacts,
and write-dependent end-to-end validation remains blocked by design.

## Remaining risks and prerequisites

- Static source analysis is not visual inspection or proof of behavioral
  equivalence.
- Renderer-dependent MCP preview/responsive tools report blocked prerequisites
  when no renderer artifact is supplied.
- PNG metric equality does not establish accessibility or design acceptance.
- A passing unit/regression suite does not prove production write safety.
- Git status could not be verified because the environment cannot launch Git.
- Any future write-enabled phase requires an independently authenticated
  authority, native/process-identity tests, durable redemption and recovery
  tests, and an independent security review.

## Safety confirmation

- Option C/read-only fallback: ACTIVE
- `designforge_apply_approved_ui`: DISABLED and fail-closed
- Application writes: DISABLED
- Production writes: DISABLED
- Human approval: NOT SIMULATED
- Production projects accessed: NONE
- 21 MCP tool names and schemas: unchanged and verified by protocol coverage
- Phase 6: NOT STARTED
