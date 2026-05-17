import 'dart:async';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import '../storage/token_storage.dart';

/// Dio interceptor that:
/// 1. Injects Bearer token on every request.
/// 2. On 401, attempts a silent token refresh then retries.
/// 3. If refresh fails, broadcasts a session-expired event.
class AuthInterceptor extends QueuedInterceptorsWrapper {
  final Dio _dio;
  final TokenStorage _tokenStorage;
  final String _baseUrl;
  final CookieJar _cookieJar;

  /// Stream that emits when the session is irrecoverably expired.
  /// The [AuthNotifier] listens to this to force logout.
  final StreamController<void> sessionExpiredController =
      StreamController<void>.broadcast();

  Stream<void> get onSessionExpired => sessionExpiredController.stream;

  AuthInterceptor({
    required Dio dio,
    required TokenStorage tokenStorage,
    required String baseUrl,
    required CookieJar cookieJar,
  }) : _dio = dio,
       _tokenStorage = tokenStorage,
       _baseUrl = baseUrl,
       _cookieJar = cookieJar;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    // Inject CSRF token for mutation requests
    final mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (mutationMethods.contains(options.method.toUpperCase())) {
      final csrfToken = await _tokenStorage.getCsrfToken();
      if (csrfToken != null && csrfToken.isNotEmpty) {
        options.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) async {
    // Extract CSRF token if present in the response body (from login/register/refresh)
    if (response.data is Map<String, dynamic>) {
      final csrfToken = response.data['csrfToken'] as String?;
      if (csrfToken != null && csrfToken.isNotEmpty) {
        await _tokenStorage.saveCsrfToken(csrfToken);
      }
    }
    handler.next(response);
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
      
      // Attach the same cookie jar so the refresh token is sent AND the new CSRF cookie is saved
      refreshDio.interceptors.add(CookieManager(_cookieJar));
      
      // Get current CSRF token for the refresh mutation
      final currentCsrfToken = await _tokenStorage.getCsrfToken();
      final headers = Map<String, dynamic>.from(err.requestOptions.headers);
      if (currentCsrfToken != null && currentCsrfToken.isNotEmpty) {
        headers['X-CSRF-Token'] = currentCsrfToken;
      }

      final refreshResponse = await refreshDio.post(
        '/auth/refresh',
        options: Options(
          headers: headers,
          extra: {'withCredentials': true},
        ),
      );

      if ((refreshResponse.statusCode == 200 ||
              refreshResponse.statusCode == 201) &&
          refreshResponse.data is Map<String, dynamic>) {
        final data = refreshResponse.data as Map<String, dynamic>;
        final newAccessToken = data['accessToken'] as String? ?? '';
        final newCsrfToken = data['csrfToken'] as String? ?? '';

        if (newAccessToken.isNotEmpty) {
          await _tokenStorage.saveAccessToken(newAccessToken);

          if (newCsrfToken.isNotEmpty) {
            await _tokenStorage.saveCsrfToken(newCsrfToken);
          }

          // Retry the original request with the new tokens
          final retryOptions = err.requestOptions;
          retryOptions.headers['Authorization'] = 'Bearer $newAccessToken';
          if (newCsrfToken.isNotEmpty) {
            retryOptions.headers['X-CSRF-Token'] = newCsrfToken;
          }

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
