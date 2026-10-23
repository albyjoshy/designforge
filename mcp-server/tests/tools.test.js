import assert from 'node:assert/strict';
import test from 'node:test';
import { loadDesignTokens } from '../dist/lib/design-tokens.js';

test('loads versioned tokens with ordered breakpoints', () => {
  const tokens = loadDesignTokens();
  assert.match(tokens.version, /^\d+\.\d+\.\d+$/);
  assert.ok(tokens.breakpoints.compactMax < tokens.breakpoints.mediumMax);
  assert.ok(tokens.breakpoints.mediumMax < tokens.breakpoints.expandedMin);
});

test('creates the MCP server with tool registrations', async () => {
  const { createServer } = await import('../dist/server.js');
  assert.ok(createServer());
});

test('evaluates supplied metadata deterministically', async () => {
  const { evaluateScreen } = await import('../dist/lib/evaluation.js');
  const result = evaluateScreen({ platform: 'mobile', screenName: 'Checkout', interactiveElementCount: 2, minTouchTarget: 40, hasSemanticLabels: false });
  assert.equal(result.summary.errors, 2);
  assert.equal(result.note, 'Evaluation uses supplied metadata only; no visual inspection was performed.');
});

test('deduplicates and sorts impact files deterministically', async () => {
  const { impact } = await import('../dist/phase5/core.js');
  const result = impact(['lib/z.dart', 'lib/a.dart', 'lib/z.dart']);
  assert.deepEqual(result.changedFiles, ['lib/a.dart', 'lib/z.dart']);
  assert.deepEqual(result.protectedFilesTouched, []);
});
