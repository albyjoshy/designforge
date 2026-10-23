# Phase 5.7E — Artifact Persistence and PNG Transfer

## Result

Verdict: **PASS** for disposable screenshot persistence and comparison.
Application writes remain disabled and production readiness is not implied.

## Failure boundary

A minimal Dart probe showed that Flutter rendering, layout, paint, `toImage`,
and PNG encoding complete. Dart stalls when it performs file existence checks
or writes under the approved artifact directory. A small Node host-side probe
successfully created, read, hashed, and removed a unique text file in that same
directory, so the failure is specific to the Dart filesystem path in this
Codex runtime rather than the directory itself.

## Transfer design

`capture_adapter_test.dart` supports an explicit test-only stream mode:

- `DESIGNFORGE_CAPTURE_STREAM=1`
- `DESIGNFORGE_CAPTURE_VIEWPORT=<one approved viewport>`

Flutter renders the actual fixture widget and returns PNG bytes and metadata.
The bounded host-side writer at
`mcp-server/scripts/capture-artifact-writer.mjs` then:

- accepts only the exact approved artifact root;
- accepts only the five allowlisted viewport filename patterns;
- enforces a 5 MiB payload limit and PNG signature;
- decodes and validates exact dimensions using the existing PNG decoder;
- refuses collisions and traversal;
- writes a unique temporary file and atomically renames it;
- reads the committed bytes back and returns the SHA-256 hash.

This is not a general-purpose file writer and does not write Flutter source or
goldens.

## Fresh artifacts

All five files were newly persisted under
`D:\New folder\designforge-ai\mcp-server\.designforge-artifacts\phase5_flutter`:

| Viewport | File | Bytes | SHA-256 | Decode |
|---|---|---:|---|---|
| 360×800 | `capture_abc123_360x800.png` | 6461 | `053d4909a672f741fde48addfb67702ed98b126b2ab9b54da805b615c4b8ee92` | PASS |
| 430×932 | `capture_abc123_430x932.png` | 7119 | `9da439cef7e4eecc6b486f2e5c7d37f1e818f8dfe720907b0c3a9ec5e2745396` | PASS |
| 768×1024 | `capture_abc123_768x1024.png` | 8989 | `11e8787655551c5221da03ce9cbfba20c597b04366c1895d875e3c16ecf41065` | PASS |
| 1024×768 | `capture_abc123_1024x768.png` | 7700 | `e75d20b8d3830bc4866d3f1a87e3e3a12aa09275fefe368bb9d14cc545ebca0e` | PASS |
| 1440×900 | `capture_abc123_1440x900.png` | 10098 | `f305c7fb1d44eb24c593ceb9d8817cb78cd9e8dfab1196eb965a3a25d7dfc4de` | PASS |

## Comparisons

Each candidate was compared with the matching existing dashboard golden using
the existing DesignForge engine:

- Dimension validation: PASS for all five.
- Pixel difference: 0% for all five.
- Mean absolute error: 0 for all five.
- Changed region: none for all five.
- Compared pixels: 288,000; 400,760; 786,432; 786,432; and 1,296,000 respectively.

These are measured deterministic comparisons, not a substitute for human
visual or accessibility acceptance.

## Integrity and security

- Fixture application source: unchanged.
- Existing golden files: unchanged.
- Golden-update flags: not used.
- Apply tool: disabled.
- Production writes: disabled.
- Authenticated host-to-MCP IPC: blocked as previously documented.
- Git verification: blocked by the existing `git.exe` process-launch failure.
