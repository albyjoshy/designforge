import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:phase5_flutter_fixture/main.dart';

void main() {
  testWidgets('candidate dashboard renders at the baseline phone viewport', (tester) async {
    tester.view.devicePixelRatio = 1;
    await tester.binding.setSurfaceSize(const Size(360, 800));
    await tester.pumpWidget(const FixtureDashboard(emphasized: true));
    await tester.pump(const Duration(milliseconds: 100));
    await expectLater(find.byKey(const ValueKey('dashboard-boundary')), matchesGoldenFile('goldens/candidate_360x800.png'));
    await tester.binding.setSurfaceSize(null);
    tester.view.resetDevicePixelRatio();
  });
}
