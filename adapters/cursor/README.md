# Cursor adapter
1. Place project instructions in `.cursor/rules/designforge.mdc` or reference `agent/AGENT.md` using your Cursor version's supported rule format.
2. Configure MCP via Cursor settings or project `.cursor/mcp.json` (sample below).
3. Restart/reload Cursor and verify `designforge_get_tokens` is available.
4. Ask: "Use DesignForge rules to audit this Flutter app; do not edit yet."

Example `.cursor/mcp.json`:
```json
{"mcpServers":{"designforge":{"command":"node","args":["/ABSOLUTE/PATH/designforge-ai/mcp-server/dist/index.js"]}}}
```
