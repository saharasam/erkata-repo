import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

import '../config/env_config.dart';
import '../storage/token_storage.dart';
import 'auth_interceptor.dart';

/// Singleton-style Dio HTTP client for the Erkata backend.
///
/// Configured with:
/// - Cookie persistence (for httpOnly refresh token)
/// - [AuthInterceptor] (Bearer token injection + silent refresh)
/// - Debug-only logging
class ApiClient {
  late final Dio dio;
  late final AuthInterceptor authInterceptor;

  final TokenStorage _tokenStorage;

  ApiClient({required TokenStorage tokenStorage})
    : _tokenStorage = tokenStorage;

  /// Must be called once at app startup before any network calls.
  Future<void> init() async {
    dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.baseUrl,
        connectTimeout: EnvConfig.connectTimeout,
        receiveTimeout: EnvConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Cookie persistence for the httpOnly refresh token
    final appDocDir = await getApplicationDocumentsDirectory();
    final cookieJar = PersistCookieJar(
      storage: FileStorage('${appDocDir.path}/.cookies/'),
    );
    dio.interceptors.add(CookieManager(cookieJar));

    // Auth interceptor (token injection + 401 refresh)
    authInterceptor = AuthInterceptor(
      dio: dio,
      tokenStorage: _tokenStorage,
      baseUrl: EnvConfig.baseUrl,
    );
    dio.interceptors.add(authInterceptor);

    // Debug logging — only in dev builds
    if (kDebugMode) {
      dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (o) => debugPrint(o.toString()),
        ),
      );
    }
  }

  void dispose() {
    authInterceptor.dispose();
    dio.close();
  }
}
