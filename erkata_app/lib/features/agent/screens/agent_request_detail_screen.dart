import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../core/models/request_status.dart';
import '../../../core/models/service_request.dart';
import '../../../core/theme/colors.dart';

class AgentRequestDetailScreen extends StatelessWidget {
  final String requestId;
  final ServiceRequest? request; // Optional, passed via extra

  const AgentRequestDetailScreen({
    super.key,
    required this.requestId,
    this.request,
  });

  @override
  Widget build(BuildContext context) {
    // Fallback if request is not passed in 'extra'
    // in real app, fetch from ID
    final req = request ?? mockRequests.firstWhere((r) => r.id == requestId);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Request #${req.id}'),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.primaryNavy),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Status
            Row(
              children: [
                _StatusBadge(status: req.status),
                const Spacer(),
                Text(
                  req.date,
                  style: TextStyle(color: Colors.grey[500], fontSize: 14),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Title & Amount
            Text(
              req.title,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryNavy,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              req.budget,
              style: const TextStyle(
                fontSize: 20,
                color: AppColors.primaryNavy,
                fontWeight: FontWeight.w600,
              ),
            ),

            const SizedBox(height: 32),
            const Divider(),
            const SizedBox(height: 20),

            // Details
            _DetailItem(
              icon: Icons.grid_view,
              label: 'Type',
              value: req.type.label,
            ),
            _DetailItem(
              icon: Icons.location_on,
              label: 'Location',
              value: req.location,
            ),
            // Mock Data fillers
            const _DetailItem(
              icon: Icons.person,
              label: 'Client',
              value: 'Abebe Kebede',
            ),
            const _DetailItem(
              icon: Icons.phone,
              label: 'Contact',
              value: '+251 911 234 567',
            ),

            const SizedBox(height: 40),

            // Actions based on status
            if (req.status == RequestStatus.newRequest ||
                req.status == RequestStatus.assigned)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => context.pop(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: BorderSide(color: Colors.red[200]!),
                        foregroundColor: Colors.red,
                      ),
                      child: const Text('Decline'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        // Accept Logic
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: AppColors.primaryGold,
                        foregroundColor: AppColors.primaryNavy,
                      ),
                      child: const Text('Accept Request'),
                    ),
                  ),
                ],
              ),

            if (req.status == RequestStatus.inProgress)
              ElevatedButton.icon(
                onPressed: () {
                  // Navigate to completion
                },
                icon: const Icon(Icons.check_circle),
                label: const Text('Mark as Completed'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 54),
                  backgroundColor: AppColors.primaryGold,
                  foregroundColor: AppColors.primaryNavy,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final RequestStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    Color bgColor;

    switch (status) {
      case RequestStatus.newRequest:
      case RequestStatus.assigned:
        color = AppColors.primaryNavy;
        bgColor = Colors.blue[50]!;
        break;
      case RequestStatus.inProgress:
        color = Colors.orange[800]!;
        bgColor = Colors.orange[50]!;
        break;
      case RequestStatus.fulfilled:
        color = Colors.green[700]!;
        bgColor = Colors.green[50]!;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _DetailItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: Colors.grey[600]),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(color: Colors.grey[500], fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: AppColors.primaryNavy,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
