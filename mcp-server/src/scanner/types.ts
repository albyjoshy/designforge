export type Evidence = { file: string; line: number; rule: string; severity: 'error' | 'warning' | 'info'; evidence: string; recommendation: string };
export type ProjectFile = { relativePath: string; absolutePath: string; content: string };
export type ScanContext = { root: string; files: ProjectFile[]; pubspec?: ProjectFile; metadata: Record<string, unknown> };
