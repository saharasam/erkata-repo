import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/errors/error_handler.dart';
import '../../../auth/state/auth_provider.dart';

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

  Future<void> requestWithdrawal(double amount) async {
    try {
      await _dio.post('/users/me/withdraw', data: {'amount': amount});
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
