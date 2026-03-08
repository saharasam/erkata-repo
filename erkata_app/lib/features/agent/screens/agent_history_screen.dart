import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../core/models/request_status.dart';
import '../../../core/models/service_request.dart';
import '../../../core/theme/colors.dart';

class AgentHistoryScreen extends StatelessWidget {
  const AgentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Filter for completed/cancelled requests
    final historyRequests = mockRequests
        .where(
          (r) => r.status == RequestStatus.fulfilled,
        ) // Add cancelled if exists
        .toList();

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        title: const Text(
          'History',
          style: TextStyle(
            color: AppColors.primaryNavy,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.primaryNavy),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: historyRequests.length,
        separatorBuilder: (_, __) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final req = historyRequests[index];
          return _HistoryTile(req: req);
        },
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
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  req.date,
                  style: TextStyle(color: Colors.grey[500], fontSize: 12),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
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
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: AppColors.primaryNavy,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${req.type.label} • ${req.location}',
              style: TextStyle(color: Colors.grey[600], fontSize: 13),
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
                Icon(Icons.chevron_right, size: 20, color: Colors.grey[300]),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
