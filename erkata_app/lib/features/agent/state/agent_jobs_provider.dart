import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/agent_repository.dart';
import '../../../../core/models/service_request.dart';

class AgentJobsNotifier extends AsyncNotifier<List<ServiceRequest>> {
  @override
  Future<List<ServiceRequest>> build() async {
    return ref.watch(agentRepositoryProvider).getMyJobs();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => ref.read(agentRepositoryProvider).getMyJobs());
  }

  Future<void> acceptJob(String id) async {
    await ref.read(agentRepositoryProvider).acceptJob(id);
    await refresh();
  }

  Future<void> declineJob(String id) async {
    await ref.read(agentRepositoryProvider).declineJob(id);
    await refresh();
  }

  Future<void> completeJob(String id) async {
    await ref.read(agentRepositoryProvider).completeJob(id);
    await refresh();
  }
}

final agentJobsProvider = AsyncNotifierProvider<AgentJobsNotifier, List<ServiceRequest>>(() {
  return AgentJobsNotifier();
});
