// Removed unused import

/// Centralised environment configuration.
class EnvConfig {
  EnvConfig._();

  /// API Base URL provided at build time via --dart-define=API_BASE_URL=...
  /// Defaults to local machine IP for physical device testing, or 10.0.2.2 for emulator.
  static const String _defaultBaseUrl = 'http://192.168.1.3:3000';
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: _defaultBaseUrl,
  );

  /// SSL Pinning Fingerprint (SHA-256)
  /// Provided at build time via --dart-define=SSL_FINGERPRINT=...
  static const String sslFingerprint = String.fromEnvironment(
    'SSL_FINGERPRINT',
    defaultValue: '', // Default empty (disable pinning if not provided)
  );

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
