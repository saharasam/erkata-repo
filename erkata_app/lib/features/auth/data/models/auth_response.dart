import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_profile.dart';

part 'auth_response.freezed.dart';
part 'auth_response.g.dart';

/// Mirrors the exact JSON shape returned by `POST /auth/login`:
/// ```json
/// { "user": { ... }, "accessToken": "..." }
/// ```
@freezed
class AuthResponse with _$AuthResponse {
  const factory AuthResponse({
    required UserProfile user,
    required String accessToken,
  }) = _AuthResponse;

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
}
