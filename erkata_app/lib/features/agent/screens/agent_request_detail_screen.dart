import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/constants.dart';
import '../../../core/models/request_status.dart';
import '../../../core/models/service_request.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

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
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'Request #${req.id}',
              subtitle: 'Agent Request Details',
              onActionTap: () => context.pop(),
            ),
            Expanded(
              child: SingleChildScrollView(
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
                          style: TextStyle(
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurfaceVariant,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Title & Amount
                    Text(
                      req.title,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      req.budget,
                      style: TextStyle(
                        fontSize: 20,
                        color: Theme.of(context).colorScheme.onSurface,
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
                                padding: const EdgeInsets.symmetric(
                                  vertical: 16,
                                ),
                                side: BorderSide(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.errorContainer,
                                ),
                                foregroundColor: Theme.of(
                                  context,
                                ).colorScheme.error,
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
                                padding: const EdgeInsets.symmetric(
                                  vertical: 16,
                                ),
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
                          backgroundColor: Theme.of(
                            context,
                          ).colorScheme.secondary,
                          foregroundColor: Theme.of(
                            context,
                          ).colorScheme.onSecondary,
                        ),
                      ),
                  ],
                ),
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
        color = Theme.of(context).brightness == Brightness.dark
            ? Colors.blue[300]!
            : AppColors.primaryNavy;
        bgColor = Theme.of(context).brightness == Brightness.dark
            ? Colors.blue.withValues(alpha: 0.1)
            : Colors.blue[50]!;
        break;
      case RequestStatus.inProgress:
        color = Theme.of(context).brightness == Brightness.dark
            ? Colors.orange[300]!
            : Colors.orange[800]!;
        bgColor = Theme.of(context).brightness == Brightness.dark
            ? Colors.orange.withValues(alpha: 0.1)
            : Colors.orange[50]!;
        break;
      case RequestStatus.fulfilled:
        color = Theme.of(context).brightness == Brightness.dark
            ? Colors.greenAccent
            : Colors.green[700]!;
        bgColor = Theme.of(context).brightness == Brightness.dark
            ? Colors.green.withValues(alpha: 0.1)
            : Colors.green[50]!;
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
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              size: 20,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
