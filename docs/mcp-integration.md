# DesignForge MCP integration

## Build

```powershell
cd mcp-server
npm install
npm run typecheck
npm run build
npm test
```

The server uses stdio. Do not write diagnostics to standard output because it is
reserved for MCP protocol messages.

## Register with Codex

```powershell
codex mcp add designforge -- node "D:\AI-Agents\designforge-ai\mcp-server\dist\index.js"
codex mcp list
```

Update the path for the actual repository location. Use either CLI registration or
the equivalent `mcp_servers.designforge` configuration entry, not both.

## Available tools

- `designforge_get_tokens` returns versioned design tokens.
- `designforge_screen_plan` creates a platform-aware screen planning template.
- `designforge_audit_checklist` returns accessibility and UI quality checks.
- `designforge_responsive_guidance` returns breakpoint and platform guidance.

Inputs are validated with Zod. The tools provide guidance and do not inspect or
modify arbitrary Flutter projects.
