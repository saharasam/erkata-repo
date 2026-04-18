import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/errors/error_handler.dart';
import '../../../../core/models/service_request.dart';
import '../../../auth/state/auth_provider.dart';

class RequestRepository {
  final Dio _dio;

  RequestRepository({required Dio dio}) : _dio = dio;

  Future<ServiceRequest> createRequest(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/requests', data: data);
      return ServiceRequest.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<List<ServiceRequest>> getMyRequests() async {
    try {
      final response = await _dio.get('/requests/my-requests');
      final list = response.data as List<dynamic>;
      return list.map((e) => ServiceRequest.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> confirmFulfillment(String requestId, bool confirmed) async {
    try {
      await _dio.post(
        '/requests/$requestId/confirm-fulfillment',
        data: {'confirmed': confirmed},
      );
    } on DioException catch (e) {
      throw ErrorHandler.fromDioException(e);
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}

final requestRepositoryProvider = Provider<RequestRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return RequestRepository(dio: apiClient.dio);
});
