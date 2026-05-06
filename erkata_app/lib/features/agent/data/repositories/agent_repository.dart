import 'dart:io';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;

import '../../../../core/errors/error_handler.dart';
import '../../../../core/models/service_request.dart';
import '../../../../core/providers/core_providers.dart';

class ReferralData {
  final String code;
  final String link;

  ReferralData({required this.code, required this.link});

  factory ReferralData.fromJson(Map<String, dynamic> json) {
    return ReferralData(
      code: json['code'] as String,
      link: json['link'] as String,
    );
  }
}

class AgentRepository {
  final Dio _dio;

  AgentRepository({required Dio dio}) : _dio = dio;

  Future<Map<String, dynamic>> getFinanceSummary() async {
    try {
      final response = await _dio.get('/users/me/finance');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<ReferralData> generateReferralCode() async {
    try {
      final response = await _dio.post('/users/me/referral-code');
      return ReferralData.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> requestWithdrawal({
    required double amount,
    required String bankName,
    required String bankAccountNumber,
    required String bankAccountHolder,
  }) async {
    try {
      await _dio.post(
        '/users/me/withdraw',
        data: {
          'amount': amount,
          'bankName': bankName,
          'bankAccountNumber': bankAccountNumber,
          'bankAccountHolder': bankAccountHolder,
        },
      );
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // ── Transactions / Jobs ──────────────────────────────────────────────────

  Future<List<ServiceRequest>> getMyJobs() async {
    try {
      final response = await _dio.get('/transactions/my-jobs');
      final list = response.data as List<dynamic>;
      return list
          .map((e) => ServiceRequest.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> acceptJob(String id) async {
    try {
      await _dio.patch('/transactions/$id/accept');
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> declineJob(String id) async {
    try {
      await _dio.patch('/transactions/$id/decline');
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> completeJob(String id, {String? outcome}) async {
    try {
      await _dio.patch(
        '/transactions/$id/complete',
        data: {'outcome': outcome},
      );
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> transferJob(String id, String toAgentId) async {
    try {
      await _dio.patch(
        '/transactions/$id/transfer',
        data: {'toAgentId': toAgentId},
      );
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> updateBusinessProfile(
    String tinNumber,
    String tradeLicenseNumber,
  ) async {
    try {
      await _dio.patch(
        '/users/me/business',
        data: {
          'tinNumber': tinNumber,
          'tradeLicenseNumber': tradeLicenseNumber,
        },
      );
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<List<dynamic>> getAvailablePackages() async {
    try {
      final response = await _dio.get('/users/me/available-packages');
      final data = response.data;
      if (data is List) {
        return data;
      }
      return [];
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<Map<String, dynamic>> getAgentProfile(String userId) async {
    try {
      final response = await _dio.get('/users/$userId/profile');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // ── Manual Upgrades ───────────────────────────────────────────────────────

  Future<Map<String, dynamic>?> getActiveUpgrade() async {
    try {
      final response = await _dio.get('/upgrades/active');
      final data = response.data;
      if (data is Map<String, dynamic>) {
        return data;
      }
      return null;
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<Map<String, dynamic>> getBankDetails() async {
    try {
      final response = await _dio.get('/upgrades/bank-details');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<Map<String, dynamic>> requestUpgrade(String targetTier) async {
    try {
      final response = await _dio.post(
        '/upgrades/request',
        data: {'targetTier': targetTier},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> submitProof(String requestId, File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final ext = imageFile.path.toLowerCase();
      final mime = ext.endsWith('.png') ? 'image/png' : 'image/jpeg';
      final base64Data = 'data:$mime;base64,${base64Encode(bytes)}';
      await _dio.patch(
        '/upgrades/$requestId/proof',
        data: {'proofUrl': base64Data},
      );
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<String> uploadImage(File file) async {
    try {
      final fileName = p.basename(file.path);
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: fileName),
      });

      final response = await _dio.post('/uploads', data: formData);
      return response.data['url'] as String;
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}

final agentRepositoryProvider = Provider<AgentRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AgentRepository(dio: apiClient.dio);
});
