declare const figma: any;
declare const __html__: string;

type Brief = { product: string; audience: string; screen: string; goal: string };
type Tokens = {
  color: Record<string, string>;
  spacing: Record<string, number>;
  radius: Record<string, number>;
  type: Record<string, number>;
};

const tokens: Tokens = {
  color: { primary: '#1B3C6E', onPrimary: '#FFFFFF', secondary: '#16A34A', accent: '#F07826', background: '#F8FAFC', surface: '#FFFFFF', text: '#142238', textMuted: '#475569', outline: '#CBD5E1' },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 8, md: 12, lg: 20 },
  type: { body: 16, bodySmall: 14, title: 22, headline: 30 }
};

function paint(hex: string) {
  const value = hex.replace('#', '');
  return { type: 'SOLID', color: { r: parseInt(value.slice(0, 2), 16) / 255, g: parseInt(value.slice(2, 4), 16) / 255, b: parseInt(value.slice(4, 6), 16) / 255 } };
}

function rect(parent: any, x: number, y: number, width: number, height: number, fill: string, radius = 0) {
  const node = figma.createRectangle();
  node.x = x; node.y = y; node.resize(width, height); node.fills = [paint(fill)];
  if (radius) node.cornerRadius = radius;
  parent.appendChild(node); return node;
}

async function text(parent: any, value: string, x: number, y: number, size: number, color: string, weight: 'Regular' | 'Bold' = 'Regular') {
  await figma.loadFontAsync({ family: 'Inter', style: weight });
  const node = figma.createText(); node.characters = value; node.fontSize = size; node.fontName = { family: 'Inter', style: weight }; node.fills = [paint(color)]; node.x = x; node.y = y; parent.appendChild(node); return node;
}

async function generate(brief: Brief) {
  const board = figma.createFrame();
  board.name = `DesignForge concept — ${brief.screen || 'Screen'}`;
  board.resize(390, 844); board.fills = [paint(tokens.color.background)]; board.cornerRadius = tokens.radius.lg;
  await text(board, brief.product || 'Product concept', tokens.spacing.xl, tokens.spacing.xl, tokens.type.title, tokens.color.text, 'Bold');
  await text(board, brief.goal || 'A clear, focused experience for the primary task.', tokens.spacing.xl, 82, tokens.type.bodySmall, tokens.color.textMuted);
  rect(board, tokens.spacing.xl, 132, 326, 56, tokens.color.primary, tokens.radius.md);
  await text(board, 'Primary action', 48, 150, tokens.type.body, tokens.color.onPrimary, 'Bold');
  await text(board, 'Recommended structure', tokens.spacing.xl, 228, tokens.type.title, tokens.color.text, 'Bold');
  const cards = ['Essential content first', 'One obvious next step', 'Accessible and responsive'];
  cards.forEach((label, index) => {
    const y = 282 + index * 92;
    rect(board, tokens.spacing.xl, y, 326, 68, tokens.color.surface, tokens.radius.md);
    rect(board, 48, y + 18, 32, 32, index === 1 ? tokens.color.accent : tokens.color.secondary, tokens.radius.sm);
    text(board, label, 96, y + 22, tokens.type.body, tokens.color.text, 'Bold');
  });
  await text(board, `Audience: ${brief.audience || 'Primary users'}`, tokens.spacing.xl, 594, tokens.type.bodySmall, tokens.color.textMuted);
  await text(board, `Screen: ${brief.screen || 'Core flow'}`, tokens.spacing.xl, 620, tokens.type.bodySmall, tokens.color.textMuted);
  figma.currentPage.appendChild(board); figma.currentPage.selection = [board]; figma.viewport.scrollAndZoomIntoView([board]);
  figma.notify('DesignForge created an editable concept frame');
}

async function createReferenceBoard(query: string, source: string, suppliedReferences?: any[]) {
  const provider = new SearchLinkProvider();
  const references = suppliedReferences?.length ? suppliedReferences : await provider.search(query, source);
  const board = figma.createFrame(); board.name = `DesignForge references — ${query}`; board.resize(720, 300); board.fills = [paint(tokens.color.background)];
  await text(board, 'Inspiration review board', 24, 24, tokens.type.title, tokens.color.text, 'Bold');
  await text(board, 'Review patterns and create an original direction. Do not copy source artwork.', 24, 58, tokens.type.bodySmall, tokens.color.textMuted);
  for (const [index, reference] of references.entries()) {
    const x = 24 + index * 220; const card = rect(board, x, 108, 196, 140, tokens.color.surface, tokens.radius.md);
    if (reference.thumbnailUrl) {
      try { const image = await figma.createImageAsync(reference.thumbnailUrl); card.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }]; } catch { /* Keep the token surface when a source blocks image access. */ }
    }
    text(board, reference.source.toUpperCase(), x + 16, 124, tokens.type.bodySmall, tokens.color.accent, 'Bold');
    text(board, reference.title, x + 16, 150, tokens.type.body, tokens.color.text, 'Bold');
    text(board, reference.url, x + 16, 190, 10, tokens.color.textMuted);
  }
  const signals = analyzeReference(query, source);
  await text(board, 'DesignForge analysis', 24, 270, tokens.type.title, tokens.color.text, 'Bold');
  signals.slice(0, 2).forEach((signal, index) => text(board, `${signal.label}: ${signal.value}`, 24 + index * 330, 310, tokens.type.bodySmall, tokens.color.textMuted));
  figma.currentPage.appendChild(board); figma.currentPage.selection = [board]; figma.viewport.scrollAndZoomIntoView([board]);
  figma.notify('DesignForge created a reviewable reference board');
}

figma.showUI(__html__, { width: 360, height: 520 });
figma.ui.onmessage = async (message: { type: string; brief?: Brief; query?: string; source?: string; references?: any[] }) => {
  if (message.type === 'generate' && message.brief) await generate(message.brief);
  if (message.type === 'reference-board' && message.query && message.source) await createReferenceBoard(message.query, message.source, message.references);
  if (message.type === 'cancel') figma.closePlugin();
};
