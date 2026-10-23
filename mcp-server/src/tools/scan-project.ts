import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { jsonResult } from '../lib/validation.js';
import { scanProject } from '../scanner/project-discovery.js';
export function registerScanProject(server: McpServer) { server.tool('designforge_scan_project','Discover Flutter project structure and metadata',{ projectPath:z.string().trim().min(1).max(4096) },async ({projectPath})=>jsonResult(await scanProject(projectPath))); }
