import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_profile.freezed.dart';
part 'user_profile.g.dart';

/// Mirrors the `user` object returned by `POST /auth/login`.
@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String id,
    String? email,
    String? phone,
    String? fullName,
    String? role,
    String? tier,
    String? tinNumber,
    String? tradeLicenseNumber,
    bool? isVerified,
    List<ReferralInfo>? referrals,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}

@freezed
class ReferralInfo with _$ReferralInfo {
  const factory ReferralInfo({
    required String id,
    required String fullName,
    required String createdAt,
    required String role,
  }) = _ReferralInfo;

  factory ReferralInfo.fromJson(Map<String, dynamic> json) =>
      _$ReferralInfoFromJson(json);
}
