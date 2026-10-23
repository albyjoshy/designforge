import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

void main() => runApp(const FixtureApp());

class FixtureApp extends StatelessWidget {
  const FixtureApp({super.key});
  @override Widget build(BuildContext context) => MaterialApp.router(
    theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue)),
    routerConfig: GoRouter(routes: [GoRoute(path: '/', builder: (_, __) => const HomeScreen())]),
  );
}

class HomeScreen extends StatefulWidget { const HomeScreen({super.key}); @override State<HomeScreen> createState() => _HomeScreenState(); }
class _HomeScreenState extends State<HomeScreen> {
  @override Widget build(BuildContext context) => LayoutBuilder(builder: (_, constraints) => Scaffold(body: SizedBox(width: 1200, child: const Text('Home'))));
}
