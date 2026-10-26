import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadDesignTokens } from './lib/design-tokens.js';
import { registerAuditChecklist } from './tools/audit-checklist.js';
import { registerGetTokens } from './tools/get-tokens.js';
import { registerResponsiveGuidance } from './tools/responsive-guidance.js';
import { registerScreenPlan } from './tools/screen-plan.js';
import { registerDesignEvaluation } from './tools/design-evaluation.js';
import { registerComponentRecommendations } from './tools/component-recommendations.js';
import { registerFlutterThemeGuidance } from './tools/flutter-theme-guidance.js';
import { registerScanProject } from './tools/scan-project.js';
import { registerDiscoverScreens } from './tools/discover-screens.js';
import { registerAnalyzeRoutes } from './tools/analyze-routes.js';
import { registerExtractTheme } from './tools/extract-theme.js';
import { registerAuditResponsive } from './tools/audit-responsive.js';
import { registerProjectReport } from './tools/project-report.js';
import { registerPhase5Tools } from './tools/phase5-tools.js';
import { registerReferenceSearch } from './tools/reference-search.js';
export function createServer() { const server = new McpServer({ name: 'designforge-ai', version: '0.5.0' }); const tokens = loadDesignTokens(); registerGetTokens(server, tokens); registerScreenPlan(server); registerAuditChecklist(server); registerResponsiveGuidance(server, tokens); registerDesignEvaluation(server); registerComponentRecommendations(server); registerFlutterThemeGuidance(server); registerScanProject(server); registerDiscoverScreens(server); registerAnalyzeRoutes(server); registerExtractTheme(server); registerAuditResponsive(server); registerProjectReport(server); registerPhase5Tools(server); registerReferenceSearch(server); return server; }
