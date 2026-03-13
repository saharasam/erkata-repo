/// Typed exception hierarchy for the Erkata app.
///
/// Every error surfaced to the UI layer is an [AppException] subtype,
/// never a raw [DioException] or platform exception.
sealed class AppException implements Exception {
  final String message;
  const AppException(this.message);

  @override
  String toString() => message;
}

/// No internet / airplane mode.
class NetworkException extends AppException {
  const NetworkException([String message = 'No internet connection'])
    : super(message);
}

/// Connection or read timeout.
class TimeoutException extends AppException {
  const TimeoutException([String message = 'Request timed out'])
    : super(message);
}

/// HTTP 5xx server errors.
class ServerException extends AppException {
  final int statusCode;
  const ServerException({
    required this.statusCode,
    String message = 'Server error',
  }) : super(message);
}

/// HTTP 401 / 403 — authentication or permission failure.
class AuthException extends AppException {
  final bool isSessionExpired;
  const AuthException({
    String message = 'Authentication failed',
    this.isSessionExpired = false,
  }) : super(message);
}

/// HTTP 400 / 422 — validation or bad-request errors.
class ValidationException extends AppException {
  final Map<String, String> fieldErrors;
  const ValidationException({
    String message = 'Validation failed',
    this.fieldErrors = const {},
  }) : super(message);
}

/// Catch-all for anything unexpected.
class UnknownException extends AppException {
  const UnknownException([String message = 'Something went wrong'])
    : super(message);
}
