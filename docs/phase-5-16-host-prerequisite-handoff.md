# Phase 5.16 — Host Prerequisite Handoff

## Status

**PASS for documentation readiness; renderer execution remains BLOCKED.**
This document records the exact external capability required to resume the
MCP renderer. It does not authorize elevation, ACL changes, application writes,
or production access.

## Established blocker

The fixed Flutter process reaches Flutter initialization but cannot complete in
the restricted MCP context:

- Normal state path: `Flutter failed to write to
  C:\Users\alby\AppData\Roaming\.flutter_tool_state` (exit 255).
- With a controlled writable state directory: `Flutter failed to open a file
  at C:\src\flutter\bin\cache\lockfile` (exit 1).

The failure occurs before widget construction, rendering, PNG encoding, or
artifact persistence. Historical direct/elevated Flutter runs and existing
Phase 5.7E PNGs are not evidence of fresh MCP rendering.

## Fixed execution contract

- Dart executable: `C:\src\flutter\bin\cache\dart-sdk\bin\dart.exe`
- Flutter snapshot: `C:\src\flutter\bin\cache\flutter_tools.snapshot`
- Fixture: `D:\New folder\designforge-ai\mcp-server\tests\fixtures\phase5_flutter`
- Artifact directory:
  `D:\New folder\designforge-ai\mcp-server\.designforge-artifacts\phase5_flutter`
- Command shape: fixed Flutter snapshot, `test test/capture_adapter_test.dart
  --no-pub`
- Viewports: 360×800, 430×932, 768×1024, 1024×768, 1440×900

The MCP request cannot choose an executable, arbitrary arguments, environment
variables, project root, or output path.

## Required host capability

The environment owner must provide a documented and explicitly approved
execution context in which the fixed process can access the Flutter state it
legitimately requires, including the SDK cache lockfile, while retaining the
existing sandbox boundary. This may require a host-level configuration outside
the repository; this task does not prescribe or perform permission changes.

The context must preserve:

- fixed executable and arguments;
- bounded runtime and output limits;
- deterministic child-process cleanup;
- exact disposable fixture restriction;
- artifact-root confinement and PNG validation;
- no arbitrary MCP command or environment injection;
- no access to production projects;
- no connection to the disabled application-write path.

## Readiness checklist

An environment owner can mark the prerequisite available only when all are
demonstrated in the MCP process context:

- [ ] Fixed Dart and Flutter snapshot paths are readable and executable.
- [ ] Required Flutter user-state operations complete without changing shared
      SDK state or deleting locks/caches.
- [ ] Required SDK lockfile access succeeds without weakening security policy.
- [ ] The fixed command runs only in `phase5_flutter` with `--no-pub`.
- [ ] Timeout and child cleanup are observable and bounded.
- [ ] Artifact output remains under the approved artifact directory.
- [ ] No MCP argument can alter executable, arguments, roots, or environment.
- [ ] The apply handler still rejects before transaction invocation.
- [ ] All 21 MCP names and schemas remain unchanged.

## Future acceptance run

Only after the host capability is explicitly approved, run the actual MCP
`designforge_responsive_test` against the disposable fixture. It must generate
new artifacts for all five viewports, prove each file was created during that
run, validate PNG signature/dimensions/hash/path, and report the artifact
references. It must also prove source and golden hashes are unchanged, child
processes are cleaned up, and the apply handler remains fail-closed.

The result of a manually successful Flutter command must remain separate from
the result of the actual MCP call. If any prerequisite fails, the MCP result
must remain `BLOCKED`.

## Safety state

Option C remains active. `designforge_apply_approved_ui`, application writes,
and production writes are disabled. No approval was simulated, no production
project was accessed, golden files were not updated, and Phase 6 has not
started.
