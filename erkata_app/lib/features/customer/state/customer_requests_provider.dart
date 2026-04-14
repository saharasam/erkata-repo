import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/request_repository.dart';
import '../../../../core/models/service_request.dart';

class CustomerRequestsNotifier extends AsyncNotifier<List<ServiceRequest>> {
  @override
  Future<List<ServiceRequest>> build() async {
    return ref.watch(requestRepositoryProvider).getMyRequests();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => ref.read(requestRepositoryProvider).getMyRequests());
  }

  Future<void> confirmFulfillment(String id, bool confirmed) async {
    // Optimistic UI or just standard reload
    await ref.read(requestRepositoryProvider).confirmFulfillment(id, confirmed);
    await refresh();
  }
}

final customerRequestsProvider = AsyncNotifierProvider<CustomerRequestsNotifier, List<ServiceRequest>>(() {
  return CustomerRequestsNotifier();
});
