import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { jsonResult } from '../lib/validation.js';
import { z } from 'zod';
const schema = { brightness: z.enum(['light', 'dark']), platform: z.enum(['android', 'ios', 'windows', 'macos', 'web']) };
export function registerFlutterThemeGuidance(server: McpServer) { server.tool('designforge_flutter_theme_guidance', 'Provide Flutter Material 3 theme guidance', schema, async ({ brightness, platform }) => jsonResult({ version: '1.0.0', brightness, platform, guidance: ['Use ThemeData(useMaterial3: true)', 'Map semantic color roles through ColorScheme', 'Respect text scaling, high contrast and reduced motion settings', 'Keep component states explicit: enabled, hovered, focused, pressed, disabled and error'] })); }
