import 'dart:async';
import 'package:dio/dio.dart';
import '../storage/token_storage.dart';

/// Dio interceptor that:
/// 1. Injects Bearer token on every request.
/// 2. On 401, attempts a silent token refresh then retries.
/// 3. If refresh fails, broadcasts a session-expired event.
class AuthInterceptor extends QueuedInterceptorsWrapper {
  final Dio _dio;
  final TokenStorage _tokenStorage;
  final String _baseUrl;

  /// Stream that emits when the session is irrecoverably expired.
  /// The [AuthNotifier] listens to this to force logout.
  final StreamController<void> sessionExpiredController =
      StreamController<void>.broadcast();

  Stream<void> get onSessionExpired => sessionExpiredController.stream;

  AuthInterceptor({
    required Dio dio,
    required TokenStorage tokenStorage,
    required String baseUrl,
  }) : _dio = dio,
       _tokenStorage = tokenStorage,
       _baseUrl = baseUrl;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Only attempt refresh on 401 responses
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    // Guard: don't retry on the refresh endpoint itself
    final requestPath = err.requestOptions.path;
    if (requestPath.contains('/auth/refresh') ||
        requestPath.contains('/auth/login')) {
      return handler.next(err);
    }

    try {
      // Attempt silent refresh using a raw Dio (no interceptor loop)
      final refreshDio = Dio(BaseOptions(baseUrl: _baseUrl));
      // Copy cookies from the main Dio instance
      // The cookie manager on _dio will include the httpOnly refresh cookie
      final refreshResponse = await refreshDio.post(
        '/auth/refresh',
        options: Options(
          headers: err.requestOptions.headers,
          extra: {'withCredentials': true},
        ),
      );

      if (refreshResponse.statusCode == 200 ||
          refreshResponse.statusCode == 201) {
        final newAccessToken =
            refreshResponse.data['accessToken'] as String? ?? '';

        if (newAccessToken.isNotEmpty) {
          await _tokenStorage.saveAccessToken(newAccessToken);

          // Retry the original request with the new token
          final retryOptions = err.requestOptions;
          retryOptions.headers['Authorization'] = 'Bearer $newAccessToken';

          final response = await _dio.fetch(retryOptions);
          return handler.resolve(response);
        }
      }

      // Refresh call returned but no valid token → session expired
      sessionExpiredController.add(null);
      handler.next(err);
    } catch (_) {
      // Refresh itself failed → session expired
      sessionExpiredController.add(null);
      handler.next(err);
    }
  }

  void dispose() {
    sessionExpiredController.close();
  }
}
