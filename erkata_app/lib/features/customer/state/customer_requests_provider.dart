import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/request_repository.dart';
import '../../../../core/models/service_request.dart';
import '../../../../core/network/socket_service.dart';

class CustomerRequestsNotifier extends AsyncNotifier<List<ServiceRequest>> {
  StreamSubscription? _socketSub;

  @override
  Future<List<ServiceRequest>> build() async {
    // Watch socket service to ensure it's initialized
    final socketService = ref.watch(socketServiceProvider);
    
    // Cleanup old subscription if any (though build() should only run once unless watched deps change)
    _socketSub?.cancel();
    
    _socketSub = socketService.notifications.listen((notification) {
      final type = notification['type'] as String?;
      if (type != null && 
          (type.startsWith('match.') || 
           type.startsWith('request.') || 
           type == 'notification')) {
        // Trigger a background refresh when a relevant event occurs
        refresh();
      }
    });

    ref.onDispose(() {
      _socketSub?.cancel();
    });

    return ref.watch(requestRepositoryProvider).getMyRequests();
  }

  Future<void> refresh() async {
    // Use guard to handle errors gracefully without breaking the stream
    final result = await AsyncValue.guard(
      () => ref.read(requestRepositoryProvider).getMyRequests()
    );
    state = result;
  }

  Future<void> confirmFulfillment(String id, bool confirmed) async {
    await ref.read(requestRepositoryProvider).confirmFulfillment(id, confirmed);
    await refresh();
  }
}

final customerRequestsProvider = AsyncNotifierProvider<CustomerRequestsNotifier, List<ServiceRequest>>(() {
  return CustomerRequestsNotifier();
});
