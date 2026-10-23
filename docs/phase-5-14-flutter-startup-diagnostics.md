# Phase 5.14 — Flutter Startup Diagnostics

## Verdict

**BLOCKED.** The MCP adapter is reaching Flutter, but the Flutter tool cannot
complete initialization in the Codex process environment. No fresh screenshot
was generated and no SDK permissions, caches, lockfiles or security settings
were changed.

## Reproduction

The fixed command was executed with a 15-second bounded timeout from the
disposable fixture:

```text
C:\src\flutter\bin\cache\dart-sdk\bin\dart.exe
  C:\src\flutter\bin\cache\flutter_tools.snapshot
  test test/capture_adapter_test.dart --no-pub
```

The MCP-equivalent environment used the fixed fixture, stream capture, approved
artifact root, `CI=true`, `FLUTTER_SUPPRESS_ANALYTICS=true`, and a controlled
`FLUTTER_CONFIG_DIR`. Exit code was **255** with empty stdout. The complete
bounded diagnostic identified:

```text
Flutter failed to write to
C:\Users\alby\AppData\Roaming\.flutter_tool_state.
```

This is the first failure with the normal environment, occurring in
`persistent_tool_state` while evaluating `OnBot`.

A second bounded run used a unique writable `APPDATA` directory inside the
approved artifact area. That removed the user-state failure and produced exit
code **1** with:

```text
Flutter failed to open a file at
C:\src\flutter\bin\cache\lockfile.
```

This distinguishes the failures from widget construction, layout, image
readback, PNG encoding, artifact persistence, or MCP response handling. Flutter
does not reach the capture test.

Read-only ACL inspection showed the SDK lockfile exists and has user `Modify`
permission in the host view, but the Codex process still cannot open it. The
controlled artifact directory is writable. No ACL was changed and no lockfile
was removed.

## Layer results

- Direct fixed Dart/Flutter launch: **BLOCKED**, exit 255 or 1 depending on the
  state directory; bounded and cleaned up.
- Adapter-equivalent launch: **BLOCKED**, same SDK initialization failure.
- Actual MCP `designforge_responsive_test`: **BLOCKED**, with the bounded
  Flutter diagnostic returned in the tool limitation; no screenshot reference.
- Child cleanup: **PASS** for the bounded diagnostic paths; no diagnostic child
  was left running.
- Fixture and golden modification: **NONE**.
- Apply path: **DISABLED** and still rejects before transaction invocation.

## Validation

The Phase 5.13 implementation was typechecked and built before diagnosis.
Existing standard tests and scoped security/regression tests passed in the
previous validation. This phase did not run Flutter tests to avoid repeating a
known initialization failure or modifying any fixture output.

The safe prerequisite for fresh MCP rendering is a Codex-approved execution
context that can open the installed Flutter SDK lockfile and use a writable
Flutter state directory. Elevating, changing ACLs, deleting caches/lockfiles,
or adding arbitrary environment overrides to MCP input would weaken the stated
boundary and was not attempted.

Application and production writes remain disabled. No approval was simulated,
no production project was accessed, and Phase 6 has not started.
