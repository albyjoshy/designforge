import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { evaluateScreen } from '../lib/evaluation.js';
import { jsonResult, screenMetadataSchema } from '../lib/validation.js';
export function registerDesignEvaluation(server: McpServer) { server.tool('designforge_evaluate_screen', 'Evaluate supplied screen metadata deterministically', screenMetadataSchema, async input => jsonResult(evaluateScreen(input))); }
