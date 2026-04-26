import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/constants.dart';
import '../../../core/models/request_status.dart';
import '../../../core/models/service_request.dart';
import '../../../core/models/request_type.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/erkata_screen_header.dart';
import '../../auth/state/auth_provider.dart';

import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../state/agent_jobs_provider.dart';

class AgentRequestDetailScreen extends HookConsumerWidget {
  final String requestId;
  final ServiceRequest? request;

  const AgentRequestDetailScreen({
    super.key,
    required this.requestId,
    this.request,
  });

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  Future<void> _showCompletionDialog(
    BuildContext context,
    WidgetRef ref,
    String id,
  ) async {
    final controller = TextEditingController();
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Complete Request',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Please provide a brief description of the outcome.',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'e.g. Transaction closed at 2.5M ETB...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.all(16),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.brandPrimary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () async {
              await ref
                  .read(agentJobsProvider.notifier)
                  .completeJob(id, outcome: controller.text);
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Request Marked as Fulfilled!')),
                );
              }
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  Future<void> _showTransferDialog(
    BuildContext context,
    WidgetRef ref,
    String id,
  ) async {
    final user = ref.read(authProvider).user;
    final referrals =
        user?.referrals?.where((r) => r.role == 'agent').toList() ?? [];

    if (referrals.isEmpty) {
      return showDialog(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text('Transfer Request'),
          content: const Text(
            'You have no referred agents to transfer this request to.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Transfer Request',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        contentPadding: const EdgeInsets.only(top: 16, bottom: 8),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: referrals.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final refInfo = referrals[index];
              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 24),
                leading: CircleAvatar(
                  backgroundColor: Theme.of(
                    context,
                  ).colorScheme.primaryContainer.withValues(alpha: 0.5),
                  child: Text(
                    refInfo.fullName[0].toUpperCase(),
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                title: Text(
                  refInfo.fullName,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                subtitle: Text(
                  'Agent',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                onTap: () async {
                  await ref
                      .read(agentJobsProvider.notifier)
                      .transferJob(id, refInfo.id);
                  if (context.mounted) {
                    Navigator.pop(context);
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Transferred to ${refInfo.fullName}'),
                      ),
                    );
                  }
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsAsync = ref.watch(agentJobsProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerLowest,
      body: SafeArea(
        child: jobsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => Center(child: Text('Error: $err')),
          data: (jobs) {
            final req = jobs.firstWhere(
              (r) => r.id == requestId,
              orElse: () =>
                  request ??
                  mockRequests.firstWhere(
                    (r) => r.id == requestId,
                    orElse: () => request!,
                  ),
            );

            final isRealEstate = req.type == RequestType.realEstate;
            final typeAccentColor = isRealEstate ? Colors.blue : Colors.orange;
            final iconData = isRealEstate
                ? Icons.home_work_outlined
                : Icons.chair_outlined;
            final typeLabel = isRealEstate ? 'Real Estate' : 'Furniture';

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ErkataScreenHeader(
                  title: 'Request Details',
                  subtitle: '#${req.id.substring(0, 8)}',
                  onActionTap: () => context.pop(),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24.0,
                        vertical: 16.0,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              _StatusBadge(status: req.status),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: typeAccentColor.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      iconData,
                                      size: 16,
                                      color: typeAccentColor,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      typeLabel,
                                      style: TextStyle(
                                        color: typeAccentColor,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          Text(
                            req.title,
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w800,
                              color: Theme.of(context).colorScheme.onSurface,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 16),

                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.location_on,
                                size: 20,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  req.location,
                                  style: TextStyle(
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurfaceVariant,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 32),

                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.surface,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.shadow.withValues(alpha: 0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                              border: Border.all(
                                color: Theme.of(context)
                                    .colorScheme
                                    .outlineVariant
                                    .withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Expected Budget',
                                        style: TextStyle(
                                          color: Theme.of(
                                            context,
                                          ).colorScheme.onSurfaceVariant,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        req.budget,
                                        style: const TextStyle(
                                          color: AppColors.brandGold,
                                          fontSize: 22,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  height: 40,
                                  width: 1,
                                  color: Theme.of(context)
                                      .colorScheme
                                      .outlineVariant
                                      .withValues(alpha: 0.5),
                                ),
                                const SizedBox(width: 20),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Submitted On',
                                        style: TextStyle(
                                          color: Theme.of(
                                            context,
                                          ).colorScheme.onSurfaceVariant,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        req.date,
                                        style: TextStyle(
                                          color: Theme.of(
                                            context,
                                          ).colorScheme.onSurface,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 32),

                          if (req.description != null &&
                              req.description!.isNotEmpty) ...[
                            Text(
                              'REQUIREMENTS',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSurfaceVariant,
                                letterSpacing: 1.2,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Theme.of(context)
                                    .colorScheme
                                    .surfaceContainerHighest
                                    .withValues(alpha: 0.3),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                req.description!,
                                style: TextStyle(
                                  fontSize: 15,
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onSurface,
                                  height: 1.6,
                                ),
                              ),
                            ),
                            const SizedBox(height: 32),
                          ],

                          Text(
                            'CLIENT DETAILS',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 12),

                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.surface,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.shadow.withValues(alpha: 0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                              border: Border.all(
                                color: Theme.of(context)
                                    .colorScheme
                                    .outlineVariant
                                    .withValues(alpha: 0.3),
                              ),
                            ),
                            child: Column(
                              children: [
                                _MinimalDetailRow(
                                  icon: Icons.person,
                                  label: 'Name',
                                  value:
                                      req.customerName ??
                                      'Hidden until accepted',
                                ),
                                if (req.customerPhone != null) ...[
                                  const Padding(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 12.0,
                                    ),
                                    child: Divider(height: 1),
                                  ),
                                  GestureDetector(
                                    onTap: () =>
                                        _makePhoneCall(req.customerPhone!),
                                    child: _MinimalDetailRow(
                                      icon: Icons.phone,
                                      label: 'Contact',
                                      value: req.customerPhone!,
                                      valueColor: Theme.of(
                                        context,
                                      ).colorScheme.primary,
                                      isActionable: true,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),

                          const SizedBox(height: 100),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
      bottomNavigationBar: jobsAsync.maybeWhen(
        data: (jobs) {
          final req = jobs.firstWhere(
            (r) => r.id == requestId,
            orElse: () =>
                request ??
                mockRequests.firstWhere(
                  (r) => r.id == requestId,
                  orElse: () => request!,
                ),
          );

          if (req.status != RequestStatus.pending &&
              req.status != RequestStatus.assigned) {
            return const SizedBox.shrink();
          }

          return Container(
            padding: EdgeInsets.fromLTRB(
              24,
              20,
              24,
              MediaQuery.of(context).padding.bottom + 20,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Theme.of(
                    context,
                  ).colorScheme.shadow.withValues(alpha: 0.08),
                  blurRadius: 20,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (req.status == RequestStatus.pending) ...[
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () async {
                            await ref
                                .read(agentJobsProvider.notifier)
                                .declineJob(req.id);
                            if (context.mounted) context.pop();
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(
                              color: Theme.of(context).colorScheme.error,
                              width: 1.5,
                            ),
                            foregroundColor: Theme.of(
                              context,
                            ).colorScheme.error,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Decline',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        flex: 2,
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: AppColors.goldGradient,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.brandGold.withValues(
                                  alpha: 0.4,
                                ),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: () async {
                              await ref
                                  .read(agentJobsProvider.notifier)
                                  .acceptJob(req.id);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Request Accepted!'),
                                  ),
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              foregroundColor: AppColors.brandPrimaryDark,
                              shadowColor: Colors.transparent,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Accept Lead',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: TextButton.icon(
                      onPressed: () =>
                          _showTransferDialog(context, ref, req.id),
                      icon: const Icon(Icons.swap_horiz),
                      label: const Text(
                        'Transfer to Referral',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      style: TextButton.styleFrom(
                        foregroundColor: Theme.of(
                          context,
                        ).colorScheme.secondary,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],

                if (req.status == RequestStatus.assigned)
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.brandPrimary,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.brandPrimary.withValues(alpha: 0.4),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: () =>
                          _showCompletionDialog(context, ref, req.id),
                      icon: const Icon(Icons.check_circle),
                      label: const Text(
                        'Mark as Completed',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        foregroundColor: Colors.white,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
        orElse: () => const SizedBox.shrink(),
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
      case RequestStatus.pending:
        color = AppColors.brandGoldDark;
        bgColor = AppColors.brandGold.withValues(alpha: 0.15);
        break;
      case RequestStatus.assigned:
        color = Colors.orange[700]!;
        bgColor = Colors.orange.withValues(alpha: 0.15);
        break;
      case RequestStatus.fulfilled:
      case RequestStatus.completed:
        color = Colors.green[700]!;
        bgColor = Colors.green.withValues(alpha: 0.15);
        break;
      case RequestStatus.disputed:
        color = Colors.red[700]!;
        bgColor = Colors.red.withValues(alpha: 0.15);
        break;
    }

    if (Theme.of(context).brightness == Brightness.dark) {
      switch (status) {
        case RequestStatus.pending:
          color = AppColors.brandGoldLight;
          break;
        case RequestStatus.assigned:
          color = Colors.orange[300]!;
          break;
        case RequestStatus.fulfilled:
        case RequestStatus.completed:
          color = Colors.greenAccent;
          break;
        case RequestStatus.disputed:
          color = Colors.red[300]!;
          break;
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.label.toUpperCase(),
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w800,
          fontSize: 12,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _MinimalDetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;
  final bool isActionable;

  const _MinimalDetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
    this.isActionable = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            size: 22,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                  color: valueColor ?? Theme.of(context).colorScheme.onSurface,
                ),
              ),
            ],
          ),
        ),
        if (isActionable)
          Icon(
            Icons.chevron_right,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            size: 20,
          ),
      ],
    );
  }
}
