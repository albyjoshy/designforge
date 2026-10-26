import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';

const port = 18787;
let child;

test.before(async () => {
  child = spawn(process.execPath, ['src/server.mjs'], { cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: String(port), DESIGNFORGE_GATEWAY_TOKEN: 'test-token', PINTEREST_ACCESS_TOKEN: '' }, stdio: ['ignore', 'ignore', 'pipe'] });
  await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error('gateway startup timeout')), 5000); child.stderr.on('data', data => { if (String(data).includes('listening')) { clearTimeout(timer); resolve(); } }); child.on('error', reject); });
});

test.after(() => child?.kill());

test('health endpoint reports gateway status', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(response.status, 200); assert.equal((await response.json()).status, 'ok');
});

test('reference search requires gateway authentication', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/design-references`, { method: 'POST', body: JSON.stringify({ query: 'dashboard' }) });
  assert.equal(response.status, 401);
});

test('mock reference search returns normalized results', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/design-references`, { method: 'POST', headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' }, body: JSON.stringify({ query: 'dashboard', sources: ['pinterest'], limit: 2 }) });
  const body = await response.json(); assert.equal(response.status, 200); assert.equal(body.results.length, 2); assert.match(body.results[0].thumbnailUrl, /^https:\/\//);
});

test('invalid search input is rejected', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/design-references`, { method: 'POST', headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' }, body: JSON.stringify({ query: 'x', sources: [] }) });
  assert.equal(response.status, 400);
});
