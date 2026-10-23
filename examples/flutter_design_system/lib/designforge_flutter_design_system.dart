import 'package:flutter/material.dart';

class DesignForgeTheme {
  static const primary = Color(0xFF1B3C6E);
  static const secondary = Color(0xFF16A34A);
  static const background = Color(0xFFF8FAFC);
  static ThemeData light() => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: primary).copyWith(primary: primary, secondary: secondary),
        scaffoldBackgroundColor: background,
        inputDecorationTheme: InputDecorationTheme(border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
      );
  static ThemeData dark() => ThemeData(useMaterial3: true, colorScheme: ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.dark));
}

class DesignForgeButton extends StatelessWidget {
  const DesignForgeButton({super.key, required this.label, required this.onPressed});
  final String label; final VoidCallback? onPressed;
  @override Widget build(BuildContext context) => SizedBox(height: 48, child: FilledButton(onPressed: onPressed, child: Text(label)));
}

class DesignForgeCard extends StatelessWidget {
  const DesignForgeCard({super.key, required this.child});
  final Widget child;
  @override Widget build(BuildContext context) => Card(margin: const EdgeInsets.all(8), child: Padding(padding: const EdgeInsets.all(16), child: child));
}

class DesignForgeTextField extends StatelessWidget {
  const DesignForgeTextField({super.key, this.label, this.controller});
  final String? label; final TextEditingController? controller;
  @override Widget build(BuildContext context) => TextField(controller: controller, decoration: InputDecoration(labelText: label));
}

class DesignForgeAdaptiveNavigation extends StatelessWidget {
  const DesignForgeAdaptiveNavigation({super.key, required this.selectedIndex, required this.onSelected});
  final int selectedIndex; final ValueChanged<int> onSelected;
  @override Widget build(BuildContext context) => LayoutBuilder(builder: (context, constraints) {
    if (constraints.maxWidth >= 840) return NavigationRail(selectedIndex: selectedIndex, onDestinationSelected: onSelected, destinations: const [NavigationRailDestination(icon: Icon(Icons.home_outlined), label: Text('Home')), NavigationRailDestination(icon: Icon(Icons.settings_outlined), label: Text('Settings'))]);
    return NavigationBar(selectedIndex: selectedIndex, onDestinationSelected: onSelected, destinations: const [NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'), NavigationDestination(icon: Icon(Icons.settings_outlined), label: 'Settings')]);
  });
}

class DesignForgeStateView extends StatelessWidget {
  const DesignForgeStateView({super.key, required this.title, required this.message, this.action});
  final String title; final String message; final Widget? action;
  @override Widget build(BuildContext context) => Center(child: Semantics(header: true, child: Column(mainAxisSize: MainAxisSize.min, children: [Text(title, style: Theme.of(context).textTheme.titleLarge), const SizedBox(height: 8), Text(message), if (action != null) ...[const SizedBox(height: 16), action!]])));
}
