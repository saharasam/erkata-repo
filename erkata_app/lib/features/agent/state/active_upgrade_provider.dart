import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/agent_repository.dart';

final activeUpgradeProvider = FutureProvider<Map<String, dynamic>?>((
  ref,
) async {
  final repository = ref.watch(agentRepositoryProvider);
  return repository.getActiveUpgrade();
});
