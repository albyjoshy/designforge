# DesignForge AI Phase 3

Phase 3 adds versioned semantic tokens at `design-system/tokens/phase-3.json`, deterministic metadata-based evaluation, platform guidance, component recommendations, Flutter theme guidance, and a standalone reference package at `examples/flutter_design_system`.

The evaluator accepts explicitly supplied screen metadata. It does not inspect pixels, source files, or running applications and reports that limitation in every result.

Guideline sources are documented in the intelligence response: Material 3 adaptive guidance, Apple Human Interface Guidelines, and WCAG 2.2. These are source labels, not claims of automated compliance.

Migration: `design-system/tokens.json` remains unchanged for Phase 2 compatibility. Consumers can migrate to the Phase 3 token schema incrementally.

New MCP tools:

- `designforge_evaluate_screen`
- `designforge_component_recommendations`
- `designforge_flutter_theme_guidance`

Validation uses `npm run typecheck`, `npm run build`, `npm test`, and, when Flutter is installed, `flutter pub get`, `flutter analyze`, and `flutter test` in the example package.
