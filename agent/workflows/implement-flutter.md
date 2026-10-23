# Flutter implementation workflow
1. Run `flutter analyze` and `flutter test` for baseline, recording failures.
2. Identify current ThemeData, widgets, routes, providers and models.
3. Introduce semantic tokens and ThemeExtension or ThemeData mapping.
4. Implement one approved screen using LayoutBuilder, SafeArea and adaptive navigation.
5. Preserve public widget APIs and business logic; avoid rewriting service/provider layers.
6. Add widget tests for compact and expanded widths, large text and empty/error states.
7. Run `dart format .`, `flutter analyze`, `flutter test`; visually review Android/iOS/Windows/web as available.
8. Summarize changed files, validation evidence, known limitations and rollback instructions.
