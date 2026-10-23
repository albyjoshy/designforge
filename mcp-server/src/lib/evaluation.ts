import type { Platform } from './intelligence.js';

export type Severity = 'error' | 'warning' | 'info';
export type ScreenMetadata = { platform: Platform; screenName: string; hasLoadingState?: boolean; hasEmptyState?: boolean; hasErrorState?: boolean; interactiveElementCount?: number; minTouchTarget?: number; hasKeyboardOrder?: boolean; hasSemanticLabels?: boolean; supportsTextScaling?: boolean; contentWidth?: number };
export type Finding = { ruleId: string; severity: Severity; evidence: string; recommendation: string };

export function evaluateScreen(input: ScreenMetadata) {
  const findings: Finding[] = [];
  const add = (ruleId: string, severity: Severity, evidence: string, recommendation: string) => findings.push({ ruleId, severity, evidence, recommendation });
  if (input.interactiveElementCount && input.interactiveElementCount > 0 && (input.minTouchTarget ?? 0) < 48) add('A11Y-TARGET-001', 'error', `minTouchTarget=${input.minTouchTarget ?? 'missing'}`, 'Use at least 48 logical pixels for interactive targets.');
  if (input.interactiveElementCount && input.interactiveElementCount > 0 && input.hasSemanticLabels === false) add('A11Y-SEMANTICS-001', 'error', 'hasSemanticLabels=false', 'Provide accessible names and roles for every interactive element.');
  if (input.supportsTextScaling === false) add('A11Y-TEXT-001', 'error', 'supportsTextScaling=false', 'Allow platform text scaling without clipping or fixed-height text containers.');
  if (input.platform === 'desktop' && input.hasKeyboardOrder === false) add('DESKTOP-FOCUS-001', 'warning', 'hasKeyboardOrder=false', 'Define a visible, deterministic keyboard focus order.');
  if (!input.hasLoadingState) add('STATE-LOADING-001', 'warning', 'hasLoadingState=false', 'Document the loading state and progress semantics.');
  if (!input.hasEmptyState) add('STATE-EMPTY-001', 'info', 'hasEmptyState=false', 'Provide an actionable empty state where content may be absent.');
  if (!input.hasErrorState) add('STATE-ERROR-001', 'warning', 'hasErrorState=false', 'Provide recovery guidance for errors and offline conditions.');
  if (input.contentWidth && input.contentWidth > 1200) add('LAYOUT-WIDTH-001', 'info', `contentWidth=${input.contentWidth}`, 'Bound wide content and preserve readable line lengths.');
  return { version: '1.0.0', screen: input.screenName, platform: input.platform, findings, summary: { total: findings.length, errors: findings.filter(f => f.severity === 'error').length, warnings: findings.filter(f => f.severity === 'warning').length, infos: findings.filter(f => f.severity === 'info').length }, note: 'Evaluation uses supplied metadata only; no visual inspection was performed.' };
}
