import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure, encrypted key-value store for auth tokens and user metadata.
///
/// Uses the platform keychain (iOS) / EncryptedSharedPrefs (Android).
class TokenStorage {
  static const _keyAccessToken = 'access_token';
  static const _keyUserId = 'user_id';
  static const _keyUserRole = 'user_role';
  static const _keyUserTier = 'user_tier';
  static const _keyUserFullName = 'user_full_name';
  static const _keyUserEmail = 'user_email';
  static const _keyHasLaunched = 'has_launched';
  static const _keyCsrfToken = 'csrf_token';
  static const _keyAvatarUrl = 'avatar_url';
  static const _keyPhone = 'user_phone';

  final FlutterSecureStorage _storage;

  TokenStorage({FlutterSecureStorage? storage})
    : _storage =
          storage ??
          const FlutterSecureStorage(
            aOptions: AndroidOptions(encryptedSharedPreferences: true),
          );

  // ──────── Write ────────

  Future<void> saveAuthData({
    required String accessToken,
    required String userId,
    required String role,
    String? tier,
    String? fullName,
    String? email,
  }) async {
    await Future.wait([
      _storage.write(key: _keyAccessToken, value: accessToken),
      _storage.write(key: _keyUserId, value: userId),
      _storage.write(key: _keyUserRole, value: role),
      if (tier != null) _storage.write(key: _keyUserTier, value: tier),
      if (fullName != null)
        _storage.write(key: _keyUserFullName, value: fullName),
      if (email != null) _storage.write(key: _keyUserEmail, value: email),
    ]);
  }

  Future<void> saveUserProfile({
    required String userId,
    required String role,
    String? tier,
    String? fullName,
    String? email,
    String? avatarUrl,
    String? phone,
  }) async {
    await Future.wait([
      _storage.write(key: _keyUserId, value: userId),
      _storage.write(key: _keyUserRole, value: role),
      if (tier != null) _storage.write(key: _keyUserTier, value: tier),
      if (fullName != null)
        _storage.write(key: _keyUserFullName, value: fullName),
      if (email != null) _storage.write(key: _keyUserEmail, value: email),
      if (avatarUrl != null)
        _storage.write(key: _keyAvatarUrl, value: avatarUrl)
      else
        _storage.delete(key: _keyAvatarUrl),
      if (phone != null) _storage.write(key: _keyPhone, value: phone),
    ]);
  }

  Future<void> saveAccessToken(String token) =>
      _storage.write(key: _keyAccessToken, value: token);

  Future<void> saveCsrfToken(String token) =>
      _storage.write(key: _keyCsrfToken, value: token);

  // ──────── Read ────────

  Future<String?> getAccessToken() => _storage.read(key: _keyAccessToken);
  Future<String?> getUserId() => _storage.read(key: _keyUserId);
  Future<String?> getUserRole() => _storage.read(key: _keyUserRole);
  Future<String?> getUserTier() => _storage.read(key: _keyUserTier);
  Future<String?> getUserFullName() => _storage.read(key: _keyUserFullName);
  Future<String?> getUserEmail() => _storage.read(key: _keyUserEmail);
  Future<String?> getCsrfToken() => _storage.read(key: _keyCsrfToken);
  Future<String?> getAvatarUrl() => _storage.read(key: _keyAvatarUrl);
  Future<String?> getPhone() => _storage.read(key: _keyPhone);

  Future<bool> isFirstLaunch() async {
    final value = await _storage.read(key: _keyHasLaunched);
    return value == null;
  }

  Future<void> markAsLaunched() =>
      _storage.write(key: _keyHasLaunched, value: 'true');

  // ──────── Clear ────────

  Future<void> clearAll() async {
    final launched = await _storage.read(key: _keyHasLaunched);
    await _storage.deleteAll();
    if (launched != null) {
      await _storage.write(key: _keyHasLaunched, value: launched);
    }
  }
}
