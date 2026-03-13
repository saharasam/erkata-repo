// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'register_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RegisterRequestImpl _$$RegisterRequestImplFromJson(
  Map<String, dynamic> json,
) => _$RegisterRequestImpl(
  email: json['email'] as String,
  fullName: json['fullName'] as String,
  password: json['password'] as String,
  role: json['role'] as String? ?? 'customer',
  tier: json['tier'] as String? ?? 'FREE',
);

Map<String, dynamic> _$$RegisterRequestImplToJson(
  _$RegisterRequestImpl instance,
) => <String, dynamic>{
  'email': instance.email,
  'fullName': instance.fullName,
  'password': instance.password,
  'role': instance.role,
  'tier': instance.tier,
};
