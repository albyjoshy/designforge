import { createServer } from 'node:http';
import crypto from 'node:crypto';
import { loadToken, saveToken } from './token-store.mjs';

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '0.0.0.0';
const gatewayToken = process.env.DESIGNFORGE_GATEWAY_TOKEN ?? 'local-development-token';
const oauthStates = new Set();
const storedToken = await loadToken();
let pinterestToken = storedToken || (process.env.PINTEREST_ACCESS_TOKEN ? { accessToken: process.env.PINTEREST_ACCESS_TOKEN } : null);

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization' });
  res.end(JSON.stringify(body));
}

function mockResults(query, sources, limit) {
  return sources.flatMap((source) => Array.from({ length: Math.min(limit, 3) }, (_, index) => ({
    title: `${query} pattern ${index + 1}`,
    source,
    url: `https://${source}.com/search/${encodeURIComponent(query)}`,
    thumbnailUrl: `https://placehold.co/640x420/F8FAFC/1B3C6E?text=${encodeURIComponent(source)}`,
    score: Number((0.94 - index * 0.08).toFixed(2)),
    usage: 'Inspiration only; review licensing and do not copy artwork.'
  }))).slice(0, limit);
}

async function pinterestResults(query, limit) {
  if (pinterestToken?.expiresAt && pinterestToken.expiresAt < Date.now() + 60_000 && pinterestToken.refreshToken) await refreshPinterestToken();
  const token = pinterestToken?.accessToken;
  if (!token) return null;
  const base = process.env.PINTEREST_API_BASE_URL ?? 'https://api.pinterest.com';
  const path = process.env.PINTEREST_SEARCH_PATH ?? '/v5/search/pins';
  const url = new URL(path, base); url.searchParams.set('query', query); url.searchParams.set('page_size', String(limit));
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } });
  if (!response.ok) throw new Error(`Pinterest returned HTTP ${response.status}`);
  const payload = await response.json();
  return (payload.items ?? []).slice(0, limit).map((pin, index) => ({
    title: pin.title || pin.description || `Pinterest reference ${index + 1}`,
    source: 'pinterest', url: pin.link || `https://www.pinterest.com/pin/${pin.id}/`,
    thumbnailUrl: pin.media?.images?.['400x300']?.url || pin.media?.images?.['600x']?.url,
    score: Number((1 - index / Math.max(limit, 1)).toFixed(2)), usage: 'Inspiration only; review licensing and do not copy artwork.'
  }));
}

async function refreshPinterestToken() {
  if (!pinterestToken?.refreshToken) return false;
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: pinterestToken.refreshToken, client_id: process.env.PINTEREST_CLIENT_ID ?? '', client_secret: process.env.PINTEREST_CLIENT_SECRET ?? '' });
  const response = await fetch('https://api.pinterest.com/v5/oauth/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) return false;
  const next = await response.json(); pinterestToken = { accessToken: next.access_token, refreshToken: next.refresh_token ?? pinterestToken.refreshToken, expiresAt: Date.now() + Number(next.expires_in ?? 0) * 1000 }; await saveToken(pinterestToken); return true;
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { status: 'ok', providerConnected: Boolean(pinterestToken?.accessToken) });
  if (req.method === 'GET' && req.url === '/api/pinterest/status') {
    if (req.headers.authorization !== `Bearer ${gatewayToken}`) return send(res, 401, { error: 'Unauthorized' });
    return send(res, 200, { connected: Boolean(pinterestToken?.accessToken), provider: 'pinterest', expiresAt: pinterestToken?.expiresAt ?? null });
  }
  if (req.method === 'GET' && req.url === '/auth/pinterest/start') {
    const clientId = process.env.PINTEREST_CLIENT_ID; const redirectUri = process.env.PINTEREST_REDIRECT_URI;
    if (!clientId || !redirectUri) return send(res, 503, { error: 'Pinterest OAuth is not configured' });
    const state = crypto.randomUUID(); oauthStates.add(state);
    const auth = new URL('https://www.pinterest.com/oauth/'); auth.searchParams.set('client_id', clientId); auth.searchParams.set('redirect_uri', redirectUri); auth.searchParams.set('response_type', 'code'); auth.searchParams.set('scope', 'pins:read boards:read'); auth.searchParams.set('state', state);
    res.writeHead(302, { location: auth.toString() }); return res.end();
  }
  if (req.method === 'GET' && req.url?.startsWith('/auth/pinterest/callback')) {
    const callback = new URL(req.url, `http://${req.headers.host}`); const state = callback.searchParams.get('state'); const code = callback.searchParams.get('code');
    if (!state || !oauthStates.delete(state) || !code) return send(res, 400, { error: 'Invalid OAuth callback' });
    const body = new URLSearchParams({ grant_type: 'authorization_code', code, client_id: process.env.PINTEREST_CLIENT_ID ?? '', client_secret: process.env.PINTEREST_CLIENT_SECRET ?? '', redirect_uri: process.env.PINTEREST_REDIRECT_URI ?? '' });
    const tokenResponse = await fetch('https://api.pinterest.com/v5/oauth/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
    if (!tokenResponse.ok) return send(res, 502, { error: 'Pinterest token exchange failed' });
    const token = await tokenResponse.json(); pinterestToken = { accessToken: token.access_token ?? '', refreshToken: token.refresh_token, expiresAt: Date.now() + Number(token.expires_in ?? 0) * 1000 }; const persisted = await saveToken(pinterestToken); return send(res, 200, { status: 'connected', expiresIn: token.expires_in ?? null, persisted, note: persisted ? 'Token encrypted at rest by the gateway.' : 'Set DESIGNFORGE_TOKEN_ENCRYPTION_KEY to enable encrypted persistence.' });
  }
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method !== 'POST' || req.url !== '/api/design-references') return send(res, 404, { error: 'Not found' });
  if (req.headers.authorization !== `Bearer ${gatewayToken}`) return send(res, 401, { error: 'Unauthorized' });
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    const input = JSON.parse(raw || '{}');
    const query = typeof input.query === 'string' ? input.query.trim() : '';
    const sources = Array.isArray(input.sources) ? input.sources.filter((x) => ['pinterest', 'dribbble', 'behance'].includes(x)) : ['pinterest'];
    const limit = Math.max(1, Math.min(Number(input.limit ?? 8), 20));
    if (query.length < 2 || sources.length === 0) return send(res, 400, { error: 'query and sources are required' });
    const pinterest = sources.includes('pinterest') ? await pinterestResults(query, limit) : null;
    const results = pinterest ?? mockResults(query, sources, limit);
    return send(res, 200, { status: 'ANALYZED', provider: pinterest ? 'pinterest' : 'mock', query, results, limitations: pinterest ? ['Provider results require independent licensing review.'] : ['Mock results are placeholders.', 'Set PINTEREST_ACCESS_TOKEN before production use.'] });
  } catch { return send(res, 400, { error: 'Invalid JSON' }); }
});

server.listen(port, host, () => console.error(`DesignForge reference gateway listening on ${host}:${port}`));
