import 'package:flutter/material.dart';

class FixtureDashboard extends StatelessWidget {
  final bool emphasized;
  const FixtureDashboard({super.key, this.emphasized = false});
  @override
  Widget build(BuildContext context) => RepaintBoundary(
    key: const ValueKey('dashboard-boundary'),
    child: MaterialApp(
      debugShowCheckedModeBanner: false,
      locale: const Locale('en', 'US'),
      theme: ThemeData(useMaterial3: true, brightness: Brightness.light, fontFamily: 'Roboto', colorSchemeSeed: emphasized ? Colors.deepPurple : Colors.blue),
      home: Scaffold(
        appBar: AppBar(title: const Text('Dashboard')),
        body: LayoutBuilder(builder: (context, constraints) {
          final wide = constraints.maxWidth >= 840;
          return Padding(padding: const EdgeInsets.all(24), child: wide
            ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(child: _summary()), const SizedBox(width: 24), Expanded(child: _activity())])
            : ListView(children: [_summary(), const SizedBox(height: 24), _activity()]));
        }),
      ),
    ),
  );
  Widget _summary() => Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [Text('Good morning', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)), SizedBox(height: 12), Text('Weekly performance'), SizedBox(height: 12), Text('\$24,680', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold))])));
  Widget _activity() => Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [Text('Recent activity', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)), ListTile(contentPadding: EdgeInsets.zero, title: Text('Invoice paid'), subtitle: Text('Today, 10:24 AM'), trailing: Text('\$840')), ListTile(contentPadding: EdgeInsets.zero, title: Text('New customer'), subtitle: Text('Yesterday, 4:12 PM'), trailing: Icon(Icons.person_add_alt_1))])));
}

void main() => runApp(const FixtureDashboard());
