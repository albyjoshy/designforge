import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const schema = {
  query: z.string().trim().min(2).max(300),
  sources: z.array(z.enum(['dribbble', 'pinterest', 'behance'])).min(1).max(3).default(['dribbble']),
  limit: z.number().int().min(1).max(20).default(8)
};

type Result = { title: string; source: string; url: string; thumbnailUrl?: string; score: number; usage: string };

export function registerReferenceSearch(server: McpServer) {
  server.tool('designforge_reference_search', 'Search an approved reference provider and normalize ranked inspiration results', schema, async ({ query, sources, limit }) => {
    const endpoint = process.env.DESIGNFORGE_REFERENCE_SEARCH_ENDPOINT;
    const token = process.env.DESIGNFORGE_REFERENCE_SEARCH_TOKEN;
    if (!endpoint || !token) return { content: [{ type: 'text', text: JSON.stringify({ status: 'BLOCKED', results: [], limitations: ['Configure DESIGNFORGE_REFERENCE_SEARCH_ENDPOINT and DESIGNFORGE_REFERENCE_SEARCH_TOKEN in the trusted server environment. Secrets are never accepted as tool arguments.'] }) }] };
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ query, sources, limit }) });
      if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
      const payload = await response.json() as { results?: Array<Partial<Result>> };
      const results: Result[] = (payload.results ?? []).slice(0, limit).map((item, index) => ({
        title: String(item.title ?? 'Untitled reference'), source: String(item.source ?? 'unknown'), url: String(item.url ?? ''), thumbnailUrl: item.thumbnailUrl ? String(item.thumbnailUrl) : undefined,
        score: typeof item.score === 'number' ? item.score : Math.max(0, 1 - index / Math.max(limit, 1)), usage: 'Inspiration only; review licensing and do not copy artwork.'
      })).filter(item => /^https?:\/\//.test(item.url));
      return { content: [{ type: 'text', text: JSON.stringify({ status: 'ANALYZED', query, results, limitations: ['Provider results require independent licensing review.', 'DesignForge does not download or reproduce source artwork.'] }) }] };
    } catch (error) {
      return { content: [{ type: 'text', text: JSON.stringify({ status: 'BLOCKED', results: [], limitations: [error instanceof Error ? error.message : 'Reference provider failed'] }) }] };
    }
  });
}
