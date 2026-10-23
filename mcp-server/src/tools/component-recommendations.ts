import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { jsonResult, platformSchema } from '../lib/validation.js';
import { z } from 'zod';
const schema = { platform: platformSchema, screenType: z.enum(['dashboard', 'form', 'table', 'navigation', 'empty', 'error']) };
const components = { dashboard: ['AdaptiveScaffold', 'SummaryCard', 'DataTable'], form: ['DesignForgeTextField', 'PrimaryButton', 'InlineValidation'], table: ['DataTable', 'SortHeader', 'Pagination'], navigation: ['NavigationBar', 'NavigationRail', 'AdaptiveScaffold'], empty: ['EmptyState', 'SecondaryButton'], error: ['ErrorState', 'RetryButton'] } as const;
export function registerComponentRecommendations(server: McpServer) { server.tool('designforge_component_recommendations', 'Recommend reusable Flutter components for a screen type', schema, async ({ platform, screenType }) => jsonResult({ version: '1.0.0', platform, screenType, components: components[screenType], accessibility: ['semantic labels', 'visible focus', 'text scaling', '48 logical pixel targets'] })); }
