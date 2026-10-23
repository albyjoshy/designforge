export type ScanContext = { root: string; files: { relativePath: string; content: string }[]; metadata: Record<string, unknown> };
