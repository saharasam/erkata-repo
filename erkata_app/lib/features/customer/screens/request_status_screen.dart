import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:erkata_app/core/models/user_role.dart';
import 'package:erkata_app/core/models/request_status.dart';
import 'package:erkata_app/core/models/service_request.dart';
import 'package:erkata_app/core/theme/colors.dart';
import 'package:erkata_app/shared/widgets/erkata_screen_header.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import '../../auth/state/auth_provider.dart';
import '../state/customer_requests_provider.dart';

class RequestStatusScreen extends HookConsumerWidget {
  final ServiceRequest request;

  const RequestStatusScreen({super.key, required this.request});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isProcessing = useState(false);
    final requestsState = ref.watch(customerRequestsProvider);
    final authState = ref.watch(authProvider);
    final currentUserId = authState.user?.id;

    final activeRequest = requestsState.maybeWhen(
      data: (list) =>
          list.firstWhere((r) => r.id == request.id, orElse: () => request),
      orElse: () => request,
    );

    final hasSubmittedFeedback =
        currentUserId != null &&
        activeRequest.feedbackAuthorIds.contains(currentUserId);

    final steps = [
      {
        'label': 'Request Submitted',
        'date': formatStatusDate(activeRequest.createdAt),
        'status': 'completed',
        'desc': 'Your request has been received.',
      },
      {
        'label': 'Routing to Operator',
        'date': activeRequest.assignedOperatorId != null
            ? formatStatusDate(activeRequest.assignmentPushedAt)
            : (activeRequest.status == RequestStatus.pending
                  ? 'In Progress'
                  : 'Completed'),
        'status':
            activeRequest.assignedOperatorId != null ? 'completed' : 'current',
        'desc': activeRequest.assignedOperatorId != null
            ? 'An operator is coordinating your request.'
            : 'Waiting for an available operator.',
      },
      {
        'label': 'Agent Assignment',
        'date':
            (activeRequest.assignedAgentName != null ||
                activeRequest.status != RequestStatus.pending)
            ? 'Completed'
            : (activeRequest.assignedOperatorId != null
                  ? 'In Progress'
                  : 'Pending'),
        'status':
            (activeRequest.assignedAgentName != null ||
                activeRequest.status != RequestStatus.pending)
            ? 'completed'
            : (activeRequest.assignedOperatorId != null
                  ? 'current'
                  : 'pending'),
        'desc': activeRequest.assignedAgentName != null
            ? '${activeRequest.assignedAgentName} is handling your case.'
            : (activeRequest.status != RequestStatus.pending
                  ? 'An agent has been assigned to your request.'
                  : 'Finding the best agent for your location.'),
      },
      {
        'label': 'Fulfillment',
        'date':
            activeRequest.status == RequestStatus.completed ||
                activeRequest.status == RequestStatus.fulfilled ||
                activeRequest.status == RequestStatus.disputed
            ? 'Processed'
            : (activeRequest.status == RequestStatus.assigned
                  ? 'In Progress'
                  : 'Pending'),
        'status':
            activeRequest.status == RequestStatus.completed ||
                activeRequest.status == RequestStatus.fulfilled ||
                activeRequest.status == RequestStatus.disputed
            ? 'completed'
            : (activeRequest.status == RequestStatus.assigned
                  ? 'current'
                  : 'pending'),
        'desc': activeRequest.status == RequestStatus.completed
            ? 'Service confirmed as successful.'
            : (activeRequest.status == RequestStatus.fulfilled
                  ? 'Agent has marked the service as complete.'
                  : (activeRequest.status == RequestStatus.disputed
                        ? 'Service reported as incomplete.'
                        : 'Agent is fulfilling your request.')),
      },
      if (activeRequest.status == RequestStatus.disputed ||
          activeRequest.status == RequestStatus.completed)
        {
          'label': 'Resolution',
          'date': activeRequest.status == RequestStatus.completed
              ? 'Settled'
              : 'Under Review',
          'status': activeRequest.status == RequestStatus.completed
              ? 'completed'
              : 'current',
          'desc': activeRequest.status == RequestStatus.completed
              ? 'Request finalized and closed.'
              : 'Our operator is reviewing your dispute report.',
        },
    ];

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: SafeArea(
        child: Column(
          children: [
            // Custom Header
            ErkataScreenHeader(
              title: 'Track Request',
              subtitle: 'ID: #${activeRequest.id}',
              onActionTap: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/activity');
                }
              },
            ),

            // Body
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    // Summary Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.pureWhite,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.offWhite),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.charcoal.withValues(alpha: 0.05),
                            blurRadius: 15,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  activeRequest.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                    color: AppColors.charcoal,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              _StatusBadge(status: activeRequest.status),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Icon(
                                Icons.location_on_outlined,
                                size: 16,
                                color: AppColors.mediumGrey,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                activeRequest.location,
                                style: const TextStyle(
                                  color: AppColors.mediumGrey,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Timeline
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: steps.length,
                      itemBuilder: (context, index) {
                        final step = steps[index];
                        final isCompleted = step['status'] == 'completed';
                        final isCurrent = step['status'] == 'current';

                        return IntrinsicHeight(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              SizedBox(
                                width: 48,
                                child: Column(
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        color: isCompleted
                                            ? AppColors.successGreen.withValues(
                                                alpha: 0.1,
                                              )
                                            : (isCurrent
                                                  ? AppColors.successGreen
                                                  : AppColors.offWhite),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: Colors.white,
                                          width: 3,
                                        ),
                                        boxShadow: [
                                          if (isCurrent || isCompleted)
                                            BoxShadow(
                                              color: AppColors.successGreen
                                                  .withValues(
                                                    alpha: isCurrent
                                                        ? 0.4
                                                        : 0.1,
                                                  ),
                                              blurRadius: isCurrent ? 12 : 4,
                                              offset: const Offset(0, 2),
                                            ),
                                        ],
                                      ),
                                      child: Icon(
                                        isCompleted
                                            ? Icons.check
                                            : (isCurrent
                                                  ? Icons.access_time
                                                  : Icons.circle_outlined),
                                        size: 18,
                                        color: isCompleted
                                            ? AppColors.successGreen
                                            : (isCurrent
                                                  ? Colors.white
                                                  : AppColors.mediumGrey),
                                      ),
                                    ),
                                    if (index < steps.length - 1)
                                      Expanded(
                                        child: Container(
                                          width: 2,
                                          margin: const EdgeInsets.symmetric(
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: isCompleted
                                                ? AppColors.successGreen
                                                      .withValues(alpha: 0.3)
                                                : AppColors.softGrey,
                                            borderRadius: BorderRadius.circular(
                                              1,
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(bottom: 32),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            step['label'] as String,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 15,
                                              color: isCurrent
                                                  ? AppColors.successGreen
                                                  : AppColors.charcoal,
                                            ),
                                          ),
                                          Text(
                                            step['date'] as String,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.mediumGrey,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        step['desc'] as String,
                                        style: const TextStyle(
                                          color: AppColors.darkGrey,
                                          fontSize: 14,
                                          height: 1.4,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 16),
                    // Confirmation Section (Only for Fulfilled)
                    if (activeRequest.status == RequestStatus.fulfilled) ...[
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppColors.brandPrimary.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: AppColors.brandPrimary.withValues(
                              alpha: 0.1,
                            ),
                          ),
                        ),
                        child: Column(
                          children: [
                            const Row(
                              children: [
                                Icon(
                                  Icons.verified_user_outlined,
                                  color: AppColors.brandPrimary,
                                  size: 28,
                                ),
                                SizedBox(width: 16),
                                Expanded(
                                  child: Text(
                                    'Confirm Fulfillment',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                      color: AppColors.brandPrimary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Please verify that the agent has completed the service to your satisfaction. Once confirmed, payment will be released to the agent.',
                              style: TextStyle(
                                color: AppColors.darkGrey,
                                fontSize: 14,
                                height: 1.5,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              children: [
                                // Dispute Button
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: isProcessing.value
                                        ? null
                                        : () async {
                                            isProcessing.value = true;
                                            try {
                                              await ref
                                                  .read(
                                                    customerRequestsProvider
                                                        .notifier,
                                                  )
                                                  .confirmFulfillment(
                                                    activeRequest.id,
                                                    false,
                                                  );
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context)
                                                    .showSnackBar(
                                                      const SnackBar(
                                                        content: Text(
                                                          'Service reported as incomplete.',
                                                        ),
                                                        backgroundColor:
                                                            AppColors.errorRed,
                                                      ),
                                                    );
                                              }
                                            } catch (e) {
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context)
                                                    .showSnackBar(
                                                      SnackBar(
                                                        content: Text(
                                                          'Error: ${e.toString()}',
                                                        ),
                                                      ),
                                                    );
                                              }
                                            } finally {
                                              isProcessing.value = false;
                                            }
                                          },
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 14,
                                      ),
                                      side: const BorderSide(
                                        color: AppColors.errorRed,
                                      ),
                                      foregroundColor: AppColors.errorRed,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                    ),
                                    child: const Text(
                                      'Dispute',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                // Confirm Button
                                Expanded(
                                  flex: 2,
                                  child: ElevatedButton(
                                    onPressed: isProcessing.value
                                        ? null
                                        : () async {
                                            isProcessing.value = true;
                                            try {
                                              await ref
                                                  .read(
                                                    customerRequestsProvider
                                                        .notifier,
                                                  )
                                                  .confirmFulfillment(
                                                    activeRequest.id,
                                                    true,
                                                  );
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context)
                                                    .showSnackBar(
                                                      const SnackBar(
                                                        content: Text(
                                                          'Service confirmed successfully!',
                                                        ),
                                                        backgroundColor:
                                                            AppColors
                                                                .successGreen,
                                                      ),
                                                    );
                                              }
                                            } catch (e) {
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context)
                                                    .showSnackBar(
                                                      SnackBar(
                                                        content: Text(
                                                          'Error: ${e.toString()}',
                                                        ),
                                                      ),
                                                    );
                                              }
                                            } finally {
                                              isProcessing.value = false;
                                            }
                                          },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.successGreen,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 14,
                                      ),
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                    ),
                                    child: isProcessing.value
                                        ? const SizedBox(
                                            height: 20,
                                            width: 20,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              color: Colors.white,
                                            ),
                                          )
                                        : const Text(
                                            'Yes, it\'s done',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: activeRequest.status == RequestStatus.completed &&
                              !hasSubmittedFeedback
                          ? ElevatedButton.icon(
                              onPressed: () {
                                if (activeRequest.transactionId == null) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Cannot leave feedback: Transaction not found.',
                                      ),
                                    ),
                                  );
                                  return;
                                }
                                context.push(
                                  '/feedback',
                                  extra: {
                                    'transactionId':
                                        activeRequest.transactionId,
                                    'recipientName':
                                        activeRequest.assignedAgentName ??
                                        'Assigned Agent',
                                    'role': UserRole.customer,
                                  },
                                );
                              },
                              icon: const Icon(Icons.star_outline, size: 20),
                              label: const Text(
                                'Leave Feedback',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.brandPrimary,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 4,
                                shadowColor: AppColors.brandPrimary.withValues(
                                  alpha: 0.3,
                                ),
                              ),
                            )
                          : const SizedBox(),
                    ),
                    const SizedBox(height: 40),
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

String formatStatusDate(String? isoDate) {
  if (isoDate == null) return 'Pending';
  try {
    final dt = DateTime.parse(isoDate);
    return DateFormat('MMM d, h:mm a').format(dt);
  } catch (_) {
    return 'Pending';
  }
}

class _StatusBadge extends StatelessWidget {
  final RequestStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;

    switch (status) {
      case RequestStatus.pending:
        bg = AppColors.infoBlueLight;
        text = AppColors.brandPrimary;
      case RequestStatus.assigned:
        bg = AppColors.warningOrangeLight;
        text = AppColors.warningOrange;
      case RequestStatus.fulfilled:
        bg = AppColors.successGreen;
        text = AppColors.pureWhite;
      case RequestStatus.disputed:
        bg = AppColors.errorRedLight;
        text = AppColors.errorRed;
        break;
      case RequestStatus.completed:
        bg = AppColors.successGreenLight;
        text = AppColors.successGreen;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: bg.withValues(alpha: 0.4),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        status.label.toUpperCase(),
        style: TextStyle(
          color: text,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
