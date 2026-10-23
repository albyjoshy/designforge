import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:designforge_flutter_design_system/designforge_flutter_design_system.dart';

void main() {
  testWidgets('button exposes label and minimum target', (tester) async {
    await tester.pumpWidget(MaterialApp(theme: DesignForgeTheme.light(), home: DesignForgeButton(label: 'Save', onPressed: () {})));
    expect(find.text('Save'), findsOneWidget);
    expect(tester.getSize(find.byType(DesignForgeButton)).height, greaterThanOrEqualTo(48));
  });
}
