import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../data/repositories/agent_repository.dart';
import '../data/models/finance_summary.dart';

final financeSummaryProvider = FutureProvider.autoDispose<FinanceSummary>((ref) async {
  final repo = ref.watch(agentRepositoryProvider);
  final data = await repo.getFinanceSummary();
  return FinanceSummary.fromJson(data);
});
