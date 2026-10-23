import type { DesignTokens } from './design-tokens.js';

export type Platform = 'mobile' | 'tablet' | 'desktop' | 'web';
export const guidanceVersion = '1.0.0';
export const guidanceSources = [
  'Material 3 adaptive design guidance',
  'Apple Human Interface Guidelines: accessibility and platform adaptation',
  'WCAG 2.2: perceivable, operable and understandable interfaces',
];

export function platformGuidance(platform: Platform) {
  const common = ['Material 3 components with semantic labels', 'Visible focus and text scaling', 'Explicit loading, empty, error and offline states'];
  const byPlatform: Record<Platform, string[]> = {
    mobile: ['SafeArea and keyboard insets', 'Bottom navigation for primary destinations', '48 logical pixel touch targets', 'Gesture alternatives for essential actions'],
    tablet: ['Navigation rail or split view when width permits', 'Orientation and window-size changes', 'Touch and keyboard input parity'],
    desktop: ['Resizable layouts with minimum content widths', 'Keyboard shortcuts and deterministic focus order', 'Pointer hover, context actions and dense readable tables'],
    web: ['Semantic HTML or accessible widgets', 'Browser history and link behavior', 'Responsive max widths and keyboard navigation'],
  };
  return { version: guidanceVersion, platform, sources: guidanceSources, guidelines: [...common, ...byPlatform[platform]] };
}

export function responsiveRecommendations(platform: Platform, tokens: DesignTokens) {
  const widthRules = [
    { range: `0-${tokens.breakpoints.compactMax}px`, behavior: 'Single-column content; compact navigation; preserve 16px minimum page padding.' },
    { range: `${tokens.breakpoints.compactMax + 1}-${tokens.breakpoints.mediumMax}px`, behavior: 'Use flexible two-pane or rail layouts only when content remains legible.' },
    { range: `${tokens.breakpoints.expandedMin}px+`, behavior: 'Use expanded navigation and bounded content widths; support resizing without clipping.' },
  ];
  return { version: guidanceVersion, platform, breakpoints: tokens.breakpoints, widthRules, recommendations: platformGuidance(platform).guidelines };
}
