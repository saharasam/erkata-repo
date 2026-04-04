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
  const NetworkException([super.message = 'No internet connection']);
}

/// Connection or read timeout.
class TimeoutException extends AppException {
  const TimeoutException([super.message = 'Request timed out']);
}

/// HTTP 5xx server errors.
class ServerException extends AppException {
  final int statusCode;
  const ServerException({
    required this.statusCode,
    super.message = 'Server error',
  });
}

/// HTTP 401 / 403 — authentication or permission failure.
class AuthException extends AppException {
  final bool isSessionExpired;
  const AuthException({
    super.message = 'Authentication failed',
    this.isSessionExpired = false,
  });
}

/// HTTP 400 / 422 — validation or bad-request errors.
class ValidationException extends AppException {
  final Map<String, String> fieldErrors;
  const ValidationException({
    super.message = 'Validation failed',
    this.fieldErrors = const {},
  });
}

/// Catch-all for anything unexpected.
class UnknownException extends AppException {
  const UnknownException([super.message = 'Something went wrong']);
}
