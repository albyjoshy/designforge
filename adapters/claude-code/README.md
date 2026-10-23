# Claude Code adapter
1. Put or reference the shared policy in your project's `CLAUDE.md`.
2. Register a local stdio MCP server using the Claude Code version's supported `claude mcp add` command or settings.
3. Typical command: `claude mcp add --transport stdio designforge -- node /ABSOLUTE/PATH/designforge-ai/mcp-server/dist/index.js`.
4. Verify with your client's MCP inspection command and test `designforge_get_tokens`.
5. Request a project audit before allowing source edits.

CLI flags vary by release; consult current client help if this command differs.
