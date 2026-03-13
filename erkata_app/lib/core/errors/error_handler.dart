import 'package:dio/dio.dart';
import 'app_exception.dart';

/// Converts raw [DioException]s into typed [AppException] subtypes.
class ErrorHandler {
  ErrorHandler._();

  static AppException fromDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const TimeoutException();

      case DioExceptionType.connectionError:
        return const NetworkException();

      case DioExceptionType.badResponse:
        return _fromStatusCode(e.response?.statusCode, e.response?.data);

      case DioExceptionType.cancel:
        return const UnknownException('Request cancelled');

      case DioExceptionType.badCertificate:
        return const NetworkException('Certificate verification failed');

      case DioExceptionType.unknown:
        if (e.error.toString().contains('SocketException')) {
          return const NetworkException();
        }
        return UnknownException(e.message ?? 'Unknown error');
    }
  }

  static AppException _fromStatusCode(int? code, dynamic data) {
    final message = _extractMessage(data);

    if (code == null) return UnknownException(message ?? 'Unexpected error');

    return switch (code) {
      400 || 422 => ValidationException(
        message: message ?? 'Invalid request',
        fieldErrors: _extractFieldErrors(data),
      ),
      401 => AuthException(
        message: message ?? 'Invalid credentials',
        isSessionExpired: false,
      ),
      403 => AuthException(
        message: message ?? 'Access denied',
        isSessionExpired: true,
      ),
      >= 500 && < 600 => ServerException(
        statusCode: code,
        message: message ?? 'Server error',
      ),
      _ => UnknownException(message ?? 'Unexpected error'),
    };
  }

  static String? _extractMessage(dynamic data) {
    if (data is Map<String, dynamic>) {
      return data['message'] as String?;
    }
    if (data is String && data.isNotEmpty) return data;
    return null;
  }

  static Map<String, String> _extractFieldErrors(dynamic data) {
    if (data is Map<String, dynamic> && data.containsKey('errors')) {
      final errors = data['errors'];
      if (errors is Map) {
        return errors.map((k, v) => MapEntry(k.toString(), v.toString()));
      }
    }
    return {};
  }
}
