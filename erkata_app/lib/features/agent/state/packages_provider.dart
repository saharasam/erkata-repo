import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/repositories/agent_repository.dart';

final availablePackagesProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.watch(agentRepositoryProvider);
  return repo.getAvailablePackages();
});
