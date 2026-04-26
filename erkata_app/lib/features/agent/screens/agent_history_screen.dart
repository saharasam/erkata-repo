import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/service_request.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../state/agent_history_provider.dart';
import '../state/agent_jobs_provider.dart';

class AgentHistoryScreen extends ConsumerWidget {
  const AgentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(agentHistoryProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'History',
              subtitle: 'Your past requests',
              onActionTap: () => context.pop(),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => ref.read(agentJobsProvider.notifier).refresh(),
                child: historyAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Center(child: Text('Error: $err')),
                  data: (historyRequests) {
                    if (historyRequests.isEmpty) {
                      return const Center(
                        child: Text('No history found.'),
                      );
                    }

                    return ListView.separated(
                      padding: const EdgeInsets.all(20),
                      itemCount: historyRequests.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final req = historyRequests[index];
                        return _HistoryTile(req: req);
                      },
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  final ServiceRequest req;

  const _HistoryTile({required this.req});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/agent/request/${req.id}', extra: req),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  req.date,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontSize: 12,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.successGreenLight.withValues(alpha: 0.1)
                        : Colors.green[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    req.status.label,
                    style: TextStyle(
                      color: Colors.green[700],
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              req.title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${req.type.label} • ${req.location}',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.check_circle, size: 16, color: Colors.green[600]),
                const SizedBox(width: 4),
                Text(
                  'Completed', // Mock completion logic
                  style: TextStyle(
                    color: Colors.green[600],
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                Icon(
                  Icons.chevron_right,
                  size: 20,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
