# DesignForge AI Phase 5 / 5.2

Phase 5 adds eight MCP tools for read-only UI planning, isolated proposal artifacts, impact analysis, approval-gated application, verification, responsive test matrices, and screenshot comparison contracts. Existing Phase 1–4 tools remain registered.

The proposal generator writes only bounded artifacts under `DESIGNFORGE_ARTIFACT_ROOT` (default: the MCP server working directory). It never edits the target Flutter project. Phase 5.2 adds a host-side explicit-confirmation issuer, canonical approval binding, persistent replay/revocation state, transaction journals, and conflict-aware rollback. The MCP apply tool remains intentionally disabled until a trusted Codex confirmation channel and disposable end-to-end verification are approved.

## Safe application contract

The future apply flow must display the canonical project path, exact files, diff, proposal hash, impact findings, and source hashes; receive an affirmative confirmation from a trusted host surface; validate the signed one-time approval; recheck canonical paths and source hashes; journal backups; atomically replace only approved presentation files; run allowlisted validation; and offer rollback without overwriting unrelated changes. Static analysis is not proof of semantic equivalence.

## Tools

`designforge_ui_change_plan`, `designforge_generate_ui_proposal`, `designforge_preview_ui`, `designforge_compare_screenshots`, `designforge_responsive_test`, `designforge_change_impact`, `designforge_apply_approved_ui`, and `designforge_verify_ui_change`.

## Example prompts

- “Create a read-only UI change plan for the authorized Flutter project.”
- “Generate an isolated proposal from this approved plan; do not edit target files.”
- “Compare these two supplied PNG screenshots.”
- “Run the responsive audit across the standard viewport matrix.”
- “Show the exact approval artifact required before applying this proposal.”
- “Verify this applied change using the available source and visual artifacts.”
