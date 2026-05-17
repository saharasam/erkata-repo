import 'package:dio/dio.dart';

import '../../../../core/errors/app_exception.dart';
import '../../../../core/errors/error_handler.dart';
import '../models/auth_response.dart';
import '../models/login_request.dart';
import '../models/register_request.dart';
import '../models/user_profile.dart';

/// Contract for auth operations against the Erkata backend.
abstract class AuthRepository {
  Future<AuthResponse> login(LoginRequest request);
  Future<void> register(RegisterRequest request);
  Future<String> refreshToken();
  Future<void> logout();
  Future<UserProfile> getProfile();
  Future<UserProfile> updateProfile(Map<String, dynamic> data);
  Future<void> changePassword(String currentPassword, String newPassword);
  Future<void> updateAvatar(String? avatarUrl);
  Future<String> uploadImage(String filePath);
}

/// Concrete implementation hitting the NestJS backend.
class AuthRepositoryImpl implements AuthRepository {
  final Dio _dio;

  AuthRepositoryImpl({required Dio dio}) : _dio = dio;

  @override
  Future<AuthResponse> login(LoginRequest request) async {
    try {
      final response = await _dio.post('/auth/login', data: request.toJson());
      return AuthResponse.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }

  @override
  Future<void> register(RegisterRequest request) async {
    try {
      await _dio.post('/auth/register', data: request.toJson());
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }

  @override
  Future<String> refreshToken() async {
    try {
      final response = await _dio.post('/auth/refresh');
      final newToken = response.data['accessToken'] as String? ?? '';
      if (newToken.isEmpty) {
        throw const AuthException(
          message: 'Refresh failed — no token returned',
          isSessionExpired: true,
        );
      }
      return newToken;
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } on AppException {
      rethrow;
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }

  @override
  Future<UserProfile> getProfile() async {
    try {
      final response = await _dio.get('/users/me');
      return UserProfile.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }

  @override
  Future<UserProfile> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch('/users/me', data: data);
      return UserProfile.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }

  @override
  Future<void> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    try {
      await _dio.patch(
        '/users/me/password',
        data: {'currentPassword': currentPassword, 'newPassword': newPassword},
      );
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }

  @override
  Future<void> updateAvatar(String? avatarUrl) async {
    try {
      await _dio.patch('/users/me/avatar', data: {'avatarUrl': avatarUrl});
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }

  @override
  Future<String> uploadImage(String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      final response = await _dio.post('/uploads', data: formData);
      return response.data['url'] as String;
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw UnknownException(message: e.toString());
    }
  }
}
