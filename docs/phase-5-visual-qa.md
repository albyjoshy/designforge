# Phase 5 visual QA

Screenshot comparison accepts references to real artifacts only. Rendering and PNG comparison are reported `BLOCKED` until a maintained local renderer/decoder adapter is installed and invoked. Missing screenshots, missing Flutter SDKs, unavailable golden tests, and unavailable platform renderers must never be reported as PASS.

Responsive checks return a deterministic viewport matrix and source-based accessibility findings. Runtime overflow, focus, safe-area, theme, and golden-test checks remain blocked when Flutter execution is unavailable.
