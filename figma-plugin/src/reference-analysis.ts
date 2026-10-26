type ReferenceSignal = { label: string; value: string; reason: string };

function analyzeReference(query: string, source: string): ReferenceSignal[] {
  const normalized = query.toLowerCase();
  const signals: ReferenceSignal[] = [
    { label: 'Structure', value: normalized.includes('dashboard') ? 'Summary → detail → action' : 'Hero → proof → next step', reason: 'Keeps the primary user task visible and scannable.' },
    { label: 'Hierarchy', value: 'One dominant action', reason: 'Reduces decision friction and improves task completion.' },
    { label: 'Responsive', value: 'Stack content below 600px', reason: 'Matches DesignForge compact-layout guidance.' },
    { label: 'Accessibility', value: 'Visible focus and 48px targets', reason: 'Preserves keyboard and touch usability.' },
    { label: 'Originality', value: 'Use patterns, not artwork', reason: `Reference came from ${source}; do not reproduce its visual assets.` }
  ];
  if (normalized.includes('calm') || normalized.includes('wellness')) signals.push({ label: 'Tone', value: 'Low-chroma surfaces with one accent', reason: 'Supports calm, confident scanning.' });
  if (normalized.includes('finance') || normalized.includes('analytics')) signals.push({ label: 'Data', value: 'Use grouped metrics and progressive disclosure', reason: 'Prevents dense dashboards from overwhelming users.' });
  return signals;
}
