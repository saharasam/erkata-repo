import 'package:flutter/foundation.dart';

/// Centralised environment configuration.
class EnvConfig {
  EnvConfig._();

  /// Android emulator uses 10.0.2.2 to reach host localhost.
  static const _devBase = 'http://192.168.1.3:3000';
  static const _prodBase = 'https://api.erkata.com';

  static String get baseUrl => kDebugMode ? _devBase : _prodBase;

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
