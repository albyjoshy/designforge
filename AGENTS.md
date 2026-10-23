# DesignForge AI Workspace Instructions

## Scope

This repository contains the reusable DesignForge AI agent, design-system assets,
MCP server, platform adapters, examples, documentation, and tests.

## Working rules

- Read `agent/AGENT.md` and the relevant workflow before making design or code changes.
- Inspect existing project structure and preserve current behavior unless the user explicitly approves a change.
- Use the tokens in `design-system/tokens.json`; avoid unexplained one-off values.
- Keep platform behavior and accessibility requirements explicit for Flutter mobile,
  tablet, desktop, and web targets.
- Do not add credentials, private project data, or generated build artifacts.
- Do not overwrite existing files or modify unrelated Flutter projects.
- Ask before destructive edits, paid dependencies, API changes, or user-flow changes.

## Validation

Run `python scripts/validate.py` from the repository root when Python is available.
For the MCP server, run `npm install` and `npm run build` inside `mcp-server` when
Node.js is available. Report unavailable tools rather than claiming validation passed.

## Delivery expectations

Summarize changed files, validation commands and results, known limitations, and the
next recommended milestone. Keep implementation changes small and reviewable.
