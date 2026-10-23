# Phase 5.7D — Capture Diagnostics

## Result

Verdict: **PARTIAL**.

The suspected Flutter image-readback hang was disproved. The instrumented
capture test completed widget construction, layout, paint, `toImage`, and PNG
encoding for the first viewport. The hang occurs when Dart performs filesystem
access for the approved artifact directory.

## Checkpoints observed

For 360×800, the direct Flutter snapshot produced these checkpoints:

`test-start` → `artifact-root-ready` → `viewport-start` → `widget-built` →
`layout-and-paint-complete` → `before-toImage` → `after-toImage` →
`after-png-encoding` → `before-temp-write`

The process then stopped making progress at the Dart file writer. The same
behavior occurred first at the asynchronous destination existence check and
then at temporary-file writing after the collision check was changed to a
synchronous check. Each diagnostic process was bounded and only the process
started by the diagnostic was terminated.

The Flutter rendering portion itself completed in approximately 0.5 seconds
for the first viewport. The emitted PNG was 360×800 and 6,461 bytes in stream
mode. It was returned as real PNG bytes from the rendered `FixtureDashboard`,
not synthesized or copied from a golden. The host-side multi-viewport artifact
write did not complete, so no fresh candidate artifact is claimed.

## Replacement investigated

The harness now supports an explicitly test-only
`DESIGNFORGE_CAPTURE_STREAM=1` mode. It returns the encoded PNG bytes and
metadata through the bounded test output instead of invoking Dart's blocked
artifact-directory writer. `DESIGNFORGE_CAPTURE_VIEWPORT` restricts a run to
one of the five approved sizes, allowing one-process-per-viewport execution.

This proves that the Flutter-native rendering/readback path is usable, but it
does not by itself complete the secure artifact workflow. The host-side
orchestration still needs a separately verified bounded writer path that can
consume each stream result and write inside the approved artifact root without
hanging. No automatic workaround was added that broadens paths, overwrites
files, or bypasses confinement.

## Safety and regression status

- Fixture application source: unchanged.
- Existing golden files: unchanged.
- Golden-update flags: not used.
- Apply tool: disabled.
- Production writes: disabled.
- Fresh five-viewport artifact set: BLOCKED.
- Fresh PNG comparison: NOT RUN.
- Authenticated host-to-MCP IPC: BLOCKED.
- Git verification: BLOCKED by the existing process-launch limitation.

The capture harness retains exact viewport validation, approved-root checks,
collision refusal, temporary-file cleanup, and bounded image operations. The
remaining blocker is the Codex/Dart filesystem interaction at the artifact
root, not Flutter widget rendering or PNG encoding.

Phase 5.7E resolved the disposable workflow with a narrow stream-to-Node
transfer. A minimal Node text probe succeeded in the artifact directory; the
host-side PNG writer then persisted and read back all five real PNGs. See
`docs/phase-5-7e-artifact-persistence.md` for hashes and comparison metrics.
