# DesignForge AI
Portable UI/UX agent starter kit for Flutter mobile, tablet, desktop, and web.

## What's included
- Shared agent policy, design rules, workflow playbooks
- Versioned JSON design tokens and Flutter ThemeData sample
- TypeScript MCP server exposing deterministic design utilities
- Cursor, Claude Code, and Antigravity adapter guidance
- Validation script and GitHub Actions CI
- Implementation roadmap and test-structure documentation

## Quick start
1. Install Node.js 20+ and npm; use Flutter stable for Flutter examples.
2. `cd mcp-server && npm install && npm run build`
3. Configure your MCP-capable client to launch `node /ABSOLUTE/PATH/designforge-ai/mcp-server/dist/index.js` with stdio.
4. Add `agent/AGENT.md` and `agent/design-rules.md` to your AI client's project instructions.
5. From the root run `python scripts/validate.py`.
6. Start with `agent/workflows/analyze-project.md`; approve a screen plan before implementation.

See `docs/implementation-plan.md` for milestone status and next steps. Test fixtures
and automated test coverage belong under `tests/`.

## What it does NOT do
The server does not read or edit arbitrary project files, connect to Figma, browse the web, or generate Flutter code automatically. Those require capabilities/permissions in the host AI client or additional integrations. No external credentials are needed for the included tools.

## MCP tools
- `designforge_get_tokens` returns the bundled token set
- `designforge_screen_plan` generates a platform-aware screen planning checklist
- `designforge_audit_checklist` returns a QA checklist for the target platform
- `designforge_responsive_guidance` returns adaptive layout guidance

## Security
Use local stdio transport. Do not expose the process directly to the internet. Pin and audit npm dependencies for deployments, use least-privilege client permissions, and review AI-proposed edits before merging.
