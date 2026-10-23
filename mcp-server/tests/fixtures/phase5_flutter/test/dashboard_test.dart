import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:phase5_flutter_fixture/main.dart';

const viewports = <({String name, double width, double height})>[
  (name: '360x800', width: 360, height: 800),
  (name: '430x932', width: 430, height: 932),
  (name: '768x1024', width: 768, height: 1024),
  (name: '1024x768', width: 1024, height: 768),
  (name: '1440x900', width: 1440, height: 900),
];

void main() {
  testWidgets('dashboard renders deterministically at every required viewport', (tester) async {
    tester.view.devicePixelRatio = 1;
    for (final viewport in viewports) {
      await tester.binding.setSurfaceSize(Size(viewport.width, viewport.height));
      await tester.pumpWidget(const FixtureDashboard());
      await tester.pump(const Duration(milliseconds: 100));
      await expectLater(find.byKey(const ValueKey('dashboard-boundary')), matchesGoldenFile('goldens/dashboard_${viewport.name}.png'));
    }
    await tester.binding.setSurfaceSize(null);
    tester.view.resetDevicePixelRatio();
  });
}
