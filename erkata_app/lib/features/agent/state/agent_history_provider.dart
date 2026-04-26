import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'agent_jobs_provider.dart';
import '../../../../core/models/service_request.dart';
import '../../../../core/models/request_status.dart';

final agentHistoryProvider = Provider<AsyncValue<List<ServiceRequest>>>((ref) {
  final jobsAsync = ref.watch(agentJobsProvider);
  
  return jobsAsync.whenData((jobs) => jobs.where((r) {
    return r.status == RequestStatus.fulfilled || 
           r.status == RequestStatus.completed;
  }).toList());
});
