import 'package:flutter/material.dart';

/// Starter palette; synchronize with design-system/tokens.json.
class DesignForgeTheme {
  static const primary = Color(0xFF1B3C6E);
  static const secondary = Color(0xFF16A34A);
  static const background = Color(0xFFF8FAFC);
  static const text = Color(0xFF142238);

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: primary,
      brightness: Brightness.light,
      surface: Colors.white,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme.copyWith(primary: primary, secondary: secondary),
      scaffoldBackgroundColor: background,
      appBarTheme: const AppBarTheme(backgroundColor: background),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}

class DesignForgeAdaptiveScaffold extends StatelessWidget {
  const DesignForgeAdaptiveScaffold({super.key, required this.title, required this.body});
  final String title;
  final Widget body;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final expanded = constraints.maxWidth >= 840;
      return Scaffold(
        appBar: AppBar(title: Text(title)),
        body: SafeArea(child: Row(children: [
          if (expanded) const SizedBox(width: 220, child: Center(child: Text('Navigation placeholder'))),
          Expanded(child: Center(child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1200),
            child: body,
          ))),
        ])),
      );
    },
  );
}
