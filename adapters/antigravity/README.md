# Google Antigravity adapter
1. Add `agent/AGENT.md` and `agent/design-rules.md` to your workspace's supported agent-instruction mechanism.
2. If your installed Antigravity version supports custom MCP servers, register a local stdio server pointing to `node /ABSOLUTE/PATH/designforge-ai/mcp-server/dist/index.js` using its MCP settings.
3. If MCP is unavailable, use the shared agent instructions and workflow files directly; do not assume a universal `@designforge` command exists.
4. Verify actual tool discovery before depending on the MCP tools.

Configuration locations and support vary by release; use your installed version's documentation.
