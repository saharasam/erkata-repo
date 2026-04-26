// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserProfileImpl _$$UserProfileImplFromJson(Map<String, dynamic> json) =>
    _$UserProfileImpl(
      id: json['id'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      fullName: json['fullName'] as String?,
      role: json['role'] as String?,
      tier: json['tier'] as String?,
      tinNumber: json['tinNumber'] as String?,
      tradeLicenseNumber: json['tradeLicenseNumber'] as String?,
      isVerified: json['isVerified'] as bool?,
      referrals: (json['referrals'] as List<dynamic>?)
          ?.map((e) => ReferralInfo.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$UserProfileImplToJson(_$UserProfileImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'phone': instance.phone,
      'fullName': instance.fullName,
      'role': instance.role,
      'tier': instance.tier,
      'tinNumber': instance.tinNumber,
      'tradeLicenseNumber': instance.tradeLicenseNumber,
      'isVerified': instance.isVerified,
      'referrals': instance.referrals,
    };

_$ReferralInfoImpl _$$ReferralInfoImplFromJson(Map<String, dynamic> json) =>
    _$ReferralInfoImpl(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      createdAt: json['createdAt'] as String,
      role: json['role'] as String,
    );

Map<String, dynamic> _$$ReferralInfoImplToJson(_$ReferralInfoImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'fullName': instance.fullName,
      'createdAt': instance.createdAt,
      'role': instance.role,
    };
