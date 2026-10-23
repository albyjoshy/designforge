import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DesignTokens } from '../lib/design-tokens.js';
import { jsonResult } from '../lib/validation.js';
export function registerGetTokens(server: McpServer, tokens: DesignTokens) { server.tool('designforge_get_tokens', 'Get versioned semantic design tokens', {}, async () => jsonResult(tokens)); }
