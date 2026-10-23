import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = fileURLToPath(new URL('./fixtures/phase5_flutter', import.meta.url));
const artifacts = fileURLToPath(new URL('../.designforge-artifacts/phase5_flutter/', import.meta.url));
const serverPath = fileURLToPath(new URL('../dist/index.js', import.meta.url));
const tracked = ['lib/main.dart', 'test/goldens/dashboard_360x800.png', 'test/goldens/dashboard_430x932.png', 'test/goldens/dashboard_768x1024.png', 'test/goldens/dashboard_1024x768.png', 'test/goldens/dashboard_1440x900.png'];

async function hashes() {
  return Object.fromEntries(await Promise.all(tracked.map(async (file) => {
    const bytes = await readFile(join(root, file));
    return [file, createHash('sha256').update(bytes).digest('hex')];
  })));
}

test('disposable Flutter read-only workflow is end-to-end and fail-closed', async () => {
  const before = await hashes();
  const client = new Client({ name: 'designforge-e2e-readonly', version: '0.1.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] });
  try {
    await client.connect(transport);
    const scan = await client.callTool({ name: 'designforge_scan_project', arguments: { projectPath: root } });
    assert.match(scan.content[0].text, /metadata|files|root/);
    const plan = await client.callTool({ name: 'designforge_ui_change_plan', arguments: { projectRoot: root, targetScreen: 'Dashboard', platform: 'desktop', designGoals: ['Improve hierarchy'], constraints: ['Preserve behavior'] } });
    assert.match(plan.content[0].text, /ANALYZED|screenInventory/);
    const proposal = await client.callTool({ name: 'designforge_generate_ui_proposal', arguments: { projectRoot: root, approvedDesignPlanId: 'disposable-plan', targetFiles: ['lib/main.dart'], requestedUiChanges: ['Improve spacing'] } });
    const proposalBody = JSON.parse(proposal.content[0].text);
    assert.equal(proposalBody.status, 'AWAITING_APPROVAL');
    const artifact = proposalBody.artifactReferences[0];
    const artifactBytes = await readFile(artifact.path);
    assert.equal(artifact.sha256, createHash('sha256').update(artifactBytes).digest('hex'));
    const impact = await client.callTool({ name: 'designforge_change_impact', arguments: { proposalId: proposalBody.proposalId, targetProjectSnapshot: { 'lib/main.dart': before['lib/main.dart'] } } });
    const impactBody = JSON.parse(impact.content[0].text);
    assert.deepEqual(impactBody.changedFiles, ['lib/main.dart']);
    const compare = await client.callTool({ name: 'designforge_compare_screenshots', arguments: { baselineScreenshot: join(artifacts, 'dashboard_360x800.png'), candidateScreenshot: join(artifacts, 'capture_abc123_360x800.png') } });
    assert.match(compare.content[0].text, /ANALYZED|dimensionValidation/);
    const responsive = await client.callTool({ name: 'designforge_responsive_test', arguments: { projectRoot: root, selectedScreen: 'Dashboard', viewportPresets: [{ name: '360x800', width: 360, height: 800 }], textScaling: 1, brightness: 'light' } });
    assert.match(responsive.content[0].text, /BLOCKED|testMatrix/);
    const apply = await client.callTool({ name: 'designforge_apply_approved_ui', arguments: { proposalId: proposalBody.proposalId, exactApprovedPatchHash: 'untrusted', authorizedProject: root, approvalReference: 'untrusted', expectedProjectSnapshot: {} } });
    assert.match(apply.content[0].text, /REJECTED|blockedChanges/);
  } finally {
    await client.close();
  }
  assert.deepEqual(await hashes(), before);
});
