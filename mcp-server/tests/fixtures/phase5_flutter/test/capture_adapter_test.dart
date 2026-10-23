import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:phase5_flutter_fixture/main.dart';

const viewports = <({String name, int width, int height})>[
  (name: '360x800', width: 360, height: 800),
  (name: '430x932', width: 430, height: 932),
  (name: '768x1024', width: 768, height: 1024),
  (name: '1024x768', width: 1024, height: 768),
  (name: '1440x900', width: 1440, height: 900),
];

void checkpoint(String stage, [Map<String, Object?> details = const {}]) {
  stderr.writeln(jsonEncode({'stage': stage, 'elapsedMs': DateTime.now().millisecondsSinceEpoch, ...details}));
}

Future<Directory> confinedOutputRoot() async {
  final configured = Platform.environment['DESIGNFORGE_CAPTURE_ROOT'];
  if (configured == null || configured.isEmpty) {
    throw StateError('DESIGNFORGE_CAPTURE_ROOT is required');
  }
  final root = Directory(configured);
  final expected = Directory(
    '${Directory.current.parent.parent.parent.path}${Platform.pathSeparator}.designforge-artifacts${Platform.pathSeparator}phase5_flutter',
  );
  final configuredPath = root.absolute.path.replaceAll('\\', '/').toLowerCase();
  final expectedPath = expected.path.replaceAll('\\', '/').toLowerCase();
  if (configuredPath != expectedPath) {
    throw StateError('Capture root is not the approved phase5_flutter artifact directory');
  }
  if (!root.existsSync()) {
    throw StateError('Approved capture root does not exist');
  }
  return root;
}

Future<File> writeCapture(Directory root, String name, List<int> bytes) async {
  if (!RegExp(r'^capture_[0-9a-f-]+_(360x800|430x932|768x1024|1024x768|1440x900)\.png$').hasMatch(name)) {
    throw StateError('Invalid capture filename');
  }
  final path = '${root.path}${Platform.pathSeparator}$name';
  final file = File(path);
  if (file.existsSync()) throw StateError('Refusing to overwrite existing capture: $path');
  final temp = File('$path.tmp-${DateTime.now().microsecondsSinceEpoch}');
  try {
    checkpoint('before-temp-write', {'path': temp.path});
    await temp.writeAsBytes(bytes).timeout(const Duration(seconds: 10));
    checkpoint('after-temp-write', {'path': temp.path});
    await temp.rename(path).timeout(const Duration(seconds: 10));
    checkpoint('after-atomic-rename', {'path': path});
  } finally {
    if (await temp.exists()) await temp.delete();
  }
  return file;
}

void main() {
  testWidgets(
    'captures fresh dashboard PNGs at the approved viewports',
    (tester) async {
    checkpoint('test-start');
    final root = await confinedOutputRoot();
    checkpoint('artifact-root-ready', {'path': root.path});
    final runId = DateTime.now().toUtc().microsecondsSinceEpoch.toRadixString(16);
    tester.view.devicePixelRatio = 1;
    final requested = Platform.environment['DESIGNFORGE_CAPTURE_VIEWPORT'];
    final selected = requested == null
        ? viewports
        : viewports.where((viewport) => viewport.name == requested).toList();
    if (selected.isEmpty) throw StateError('Unsupported capture viewport');
    for (final viewport in selected) {
      checkpoint('viewport-start', {'viewport': viewport.name});
      await tester.binding.setSurfaceSize(Size(viewport.width.toDouble(), viewport.height.toDouble()));
      await tester.pumpWidget(const FixtureDashboard());
      checkpoint('widget-built', {'viewport': viewport.name});
      await tester.pump(const Duration(milliseconds: 100));
      checkpoint('layout-and-paint-complete', {'viewport': viewport.name});
      final boundary = tester.renderObject<RenderRepaintBoundary>(find.byKey(const ValueKey('dashboard-boundary')));
      checkpoint('before-toImage', {'viewport': viewport.name});
      final image = await boundary.toImage(pixelRatio: 1).timeout(const Duration(seconds: 10));
      checkpoint('after-toImage', {'viewport': viewport.name});
      try {
        if (image.width != viewport.width || image.height != viewport.height) {
          throw StateError('Unexpected capture dimensions ${image.width}x${image.height} for ${viewport.name}');
        }
        final data = await image.toByteData(format: ui.ImageByteFormat.png).timeout(const Duration(seconds: 10));
        checkpoint('after-png-encoding', {'viewport': viewport.name});
        if (data == null || data.lengthInBytes == 0) throw StateError('PNG encoding returned no bytes');
        final bytes = data.buffer.asUint8List();
        if (Platform.environment['DESIGNFORGE_CAPTURE_STREAM'] == '1') {
          checkpoint('after-png-stream', {'viewport': viewport.name, 'bytes': bytes.length});
          print(jsonEncode({'viewport': '${viewport.width}x${viewport.height}', 'bytes': bytes.length, 'width': image.width, 'height': image.height, 'pngBase64': base64Encode(bytes)}));
        } else {
          final file = await writeCapture(root, 'capture_${runId}_${viewport.name}.png', bytes);
          checkpoint('after-confined-write', {'viewport': viewport.name, 'path': file.path});
          print(jsonEncode({'viewport': '${viewport.width}x${viewport.height}', 'path': file.path, 'bytes': bytes.length, 'width': image.width, 'height': image.height}));
        }
      } finally {
        image.dispose();
      }
    }
    await tester.binding.setSurfaceSize(null);
    tester.view.resetDevicePixelRatio();
    },
    skip: Platform.environment['DESIGNFORGE_CAPTURE_ROOT'] == null,
  );
}
