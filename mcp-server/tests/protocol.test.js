import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

const serverPath = fileURLToPath(new URL('../dist/index.js', import.meta.url));

async function withClient(callback) {
  const client = new Client({ name: 'designforge-smoke-test', version: '0.1.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] });
  try {
    await client.connect(transport);
    return await callback(client);
  } finally {
    await client.close();
  }
}

test('lists and invokes all twenty-one DesignForge MCP tools', async () => {
  await withClient(async (client) => {
    const listed = await client.listTools();
    const names = listed.tools.map((tool) => tool.name).sort();
    assert.deepEqual(names, [
      'designforge_analyze_routes',
      'designforge_apply_approved_ui',
      'designforge_audit_checklist',
      'designforge_audit_responsive',
      'designforge_change_impact',
      'designforge_compare_screenshots',
      'designforge_component_recommendations',
      'designforge_discover_screens',
      'designforge_evaluate_screen',
      'designforge_extract_theme',
      'designforge_flutter_theme_guidance',
      'designforge_generate_ui_proposal',
      'designforge_get_tokens',
      'designforge_preview_ui',
      'designforge_project_report',
      'designforge_responsive_guidance',
      'designforge_responsive_test',
      'designforge_scan_project',
      'designforge_screen_plan',
      'designforge_ui_change_plan',
      'designforge_verify_ui_change',
    ]);

    const tokens = await client.callTool({ name: 'designforge_get_tokens', arguments: {} });
    assert.match(tokens.content[0].text, /"version"/);

    const plan = await client.callTool({ name: 'designforge_screen_plan', arguments: {
      screenName: 'Mobile Dashboard', platform: 'mobile', primaryTask: 'Review account activity',
    } });
    assert.match(plan.content[0].text, /Mobile Dashboard/);

    const audit = await client.callTool({ name: 'designforge_audit_checklist', arguments: { platform: 'mobile' } });
    assert.match(audit.content[0].text, /Accessibility|Contrast/);

    const guidance = await client.callTool({ name: 'designforge_responsive_guidance', arguments: { platform: 'desktop' } });
    assert.match(guidance.content[0].text, /desktop|Keyboard/i);

    const evaluation = await client.callTool({ name: 'designforge_evaluate_screen', arguments: {
      screenName: 'Checkout', platform: 'mobile', interactiveElementCount: 2, minTouchTarget: 48,
      hasSemanticLabels: true, supportsTextScaling: true, hasLoadingState: true, hasEmptyState: true, hasErrorState: true,
    } });
    assert.match(evaluation.content[0].text, /Checkout/);

    const components = await client.callTool({ name: 'designforge_component_recommendations', arguments: { platform: 'tablet', screenType: 'dashboard' } });
    assert.match(components.content[0].text, /AdaptiveScaffold|SummaryCard/);

    const theme = await client.callTool({ name: 'designforge_flutter_theme_guidance', arguments: { brightness: 'dark', platform: 'windows' } });
    assert.match(theme.content[0].text, /useMaterial3|dark|windows/i);

    const projectPath = fileURLToPath(new URL('./fixtures/flutter_app', import.meta.url));
    for (const name of ['designforge_scan_project', 'designforge_discover_screens', 'designforge_analyze_routes', 'designforge_extract_theme', 'designforge_audit_responsive', 'designforge_project_report']) {
      const result = await client.callTool({ name, arguments: { projectPath } });
      assert.match(result.content[0].text, /version|metadata|screens|routes|themes|findings/i);
    }

    const phase5Plan = await client.callTool({ name: 'designforge_ui_change_plan', arguments: { projectRoot: projectPath, targetScreen: 'HomeScreen', platform: 'mobile', designGoals: ['Improve hierarchy'], constraints: ['Preserve navigation'] } });
    assert.match(phase5Plan.content[0].text, /ANALYZED|screenInventory/);
    const proposal = await client.callTool({ name: 'designforge_generate_ui_proposal', arguments: { projectRoot: projectPath, approvedDesignPlanId: 'fixture-plan', targetFiles: ['lib/main.dart'], requestedUiChanges: ['Improve spacing'] } });
    assert.match(proposal.content[0].text, /proposalId|AWAITING_APPROVAL/);
    const proposalId = JSON.parse(proposal.content[0].text).proposalId;
    const preview = await client.callTool({ name: 'designforge_preview_ui', arguments: { proposalId, previewProfile: 'fixture', viewport: { width: 360, height: 800, devicePixelRatio: 1 } } });
    assert.match(preview.content[0].text, /BLOCKED|missingPrerequisites/);
    const compare = await client.callTool({ name: 'designforge_compare_screenshots', arguments: { baselineScreenshot: 'missing-baseline.png', candidateScreenshot: 'missing-candidate.png' } });
    assert.match(compare.content[0].text, /BLOCKED|limitations/);
    const responsive = await client.callTool({ name: 'designforge_responsive_test', arguments: { projectRoot: projectPath, selectedScreen: 'HomeScreen', viewportPresets: [{ name: 'small-phone', width: 360, height: 800 }], textScaling: 1, brightness: 'light' } });
    assert.match(responsive.content[0].text, /BLOCKED|testMatrix/);
    const impact = await client.callTool({ name: 'designforge_change_impact', arguments: { proposalId, targetProjectSnapshot: { 'lib/main.dart': 'hash' } } });
    assert.match(impact.content[0].text, /changedFiles|approvalEligible/);
    const apply = await client.callTool({ name: 'designforge_apply_approved_ui', arguments: { proposalId, exactApprovedPatchHash: 'hash', authorizedProject: projectPath, approvalReference: 'untrusted-test-reference', expectedProjectSnapshot: {} } });
    assert.match(apply.content[0].text, /REJECTED|blockedChanges/);
    const verify = await client.callTool({ name: 'designforge_verify_ui_change', arguments: { appliedChangeReference: 'not-applied', verificationProfile: {} } });
    assert.match(verify.content[0].text, /BLOCKED|releaseRecommendation/);
  });
});
