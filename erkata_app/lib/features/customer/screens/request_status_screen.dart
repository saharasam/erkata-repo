import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:erkata_app/core/models/user_role.dart';
import 'package:erkata_app/core/models/request_status.dart';
import 'package:erkata_app/core/models/service_request.dart';
import 'package:erkata_app/core/models/request_type.dart';
import 'package:erkata_app/core/theme/colors.dart';
import 'package:erkata_app/shared/widgets/erkata_screen_header.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import '../state/customer_requests_provider.dart';

class RequestStatusScreen extends HookConsumerWidget {
  const RequestStatusScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(customerRequestsProvider);
    final selectedRequest = useState<ServiceRequest?>(null);
    final selectedFilter = useState<String>('All');

    // Detail View
    if (selectedRequest.value != null) {
      return _RequestDetailView(
        request: selectedRequest.value!,
        onClose: () => selectedRequest.value = null,
      );
    }

    final filters = ['All', 'Pending', 'Assigned', 'Completed'];

    // List View
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Custom Header
            ErkataScreenHeader(
              title: 'My Requests',
              subtitle: 'Track your service requests',
              onActionTap: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/home');
                }
              },
            ),

            // Status Filter Tabs
            Container(
              height: 44,
              margin: const EdgeInsets.only(bottom: 8),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: filters.length,
                itemBuilder: (context, index) {
                  final filter = filters[index];
                  final isSelected = selectedFilter.value == filter;
                  return GestureDetector(
                    onTap: () => selectedFilter.value = filter,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.primary.withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ]
                            : [
                                BoxShadow(
                                  color: Theme.of(
                                    context,
                                  ).shadowColor.withValues(alpha: 0.05),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        filter,
                        style: TextStyle(
                          color: isSelected
                              ? Theme.of(context).colorScheme.onPrimary
                              : Theme.of(context).colorScheme.onSurfaceVariant,
                          fontSize: 13,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.w500,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 4),

            // Request List
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => ref.read(customerRequestsProvider.notifier).refresh(),
                child: requestsAsync.when(
                  data: (requests) {
                    final filteredRequests = requests.where((req) {
                      if (selectedFilter.value == 'All') return true;
                      return req.status.name.toLowerCase() == selectedFilter.value.toLowerCase();
                    }).toList();

                    if (filteredRequests.isEmpty) {
                      return ListView(
                        children: [
                          SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                          const Center(
                            child: Padding(
                              padding: EdgeInsets.all(40.0),
                              child: Text(
                                'No requests found for this status.',
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        ],
                      );
                    }

                    return ListView.separated(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 8,
                      ),
                      itemCount: filteredRequests.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final req = filteredRequests[index];
                        return _RequestCard(
                          request: req,
                          onTap: () => selectedRequest.value = req,
                        );
                      },
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Center(child: Text('Error: $err')),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final ServiceRequest request;
  final VoidCallback onTap;

  const _RequestCard({required this.request, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final imageUrl = request.type == RequestType.realEstate
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhjbYgA0zDCprIiCjUZ_u9zudXAkCc0_uxJM-KtfNoFk0P8ZCRQJC3gFygYd55L_vSbYl5Hf7OMgnK0ZW3TJEGNAVKv5xFdO397yNTM8qPb3oVDmDt7zK1ORX_mQB189EXVO4kP9S09ndpnsJJGiPAajcUUPVROk_TaxedTXOkvGCk8kyw9OzTrboQyK-cYlEqPMYAryBM9ReBze5OL6gmairMmlDocWt0nPjoMfFTiPCPGV3ra-Da-JThYZF7-7mQ6YJPMzOA29NQ'
        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGAXc3Mbyc4713K5yW5fQOPPIvXHXHh7wuFWxHxPnz_E5pAV7WbbcNGoVO9vXTtimgOswpsZIOKFaNnJEaRq44F9e7XyVxIx98lgCp-c2hwjWYEOPM_Iieuv7InM4dhj1kL19A4vthjQXa67aXJjegD4ZIOfD4OdSQSwc4jvSVaA76p9j-cgiL3R0JvTJMs0fAtq2CZsGt_OViUC3a_gkt6ijN8D4uYvWJre3EfOZZTI7FJkXXV0QDtjjoPHjV9zkrVSxK1adT9-qm';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).shadowColor.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage(imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            // Content Section
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        request.type.name,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                      _StatusBadge(status: request.status),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.calendar_today,
                        size: 1,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Submitted on ${request.date}',
                        style: TextStyle(
                          fontSize: 11,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.infoBlueLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          request.budget,
                          style: const TextStyle(
                            color: AppColors.brandPrimary,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 12,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        request.location,
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ],
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        status.label.toUpperCase(),
        style: TextStyle(
          color: text,
          fontSize: 9,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _RequestDetailView extends HookConsumerWidget {
  final ServiceRequest request;
  final VoidCallback onClose;

  const _RequestDetailView({required this.request, required this.onClose});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isProcessing = useState(false);
    final steps = [
      {
        'label': 'Request Submitted',
        'date': formatStatusDate(request.createdAt),
        'status': 'completed',
        'desc': 'Your request has been received.',
      },
      {
        'label': 'Routing to Operator',
        'date': request.assignedOperatorId != null
            ? formatStatusDate(request.assignmentPushedAt)
            : (request.status == RequestStatus.pending ? 'In Progress' : 'Completed'),
        'status': request.assignedOperatorId != null ? 'completed' : 'current',
        'desc': request.assignedOperatorId != null
            ? 'An operator is coordinating your request.'
            : 'Waiting for an available operator.',
      },
      {
        'label': 'Agent Assignment',
        'date': request.assignedAgentName != null
            ? 'Completed'
            : (request.assignedOperatorId != null ? 'In Progress' : 'Pending'),
        'status': request.assignedAgentName != null
            ? 'completed'
            : (request.assignedOperatorId != null ? 'current' : 'pending'),
        'desc': request.assignedAgentName != null
            ? '${request.assignedAgentName} is handling your case.'
            : 'Finding the best agent for your location.',
      },
      {
        'label': 'Fulfillment',
        'date': request.status == RequestStatus.completed || request.status == RequestStatus.fulfilled || request.status == RequestStatus.disputed
            ? 'Processed'
            : (request.status == RequestStatus.assigned ? 'In Progress' : 'Pending'),
        'status': request.status == RequestStatus.completed || request.status == RequestStatus.fulfilled || request.status == RequestStatus.disputed
            ? 'completed'
            : (request.status == RequestStatus.assigned ? 'current' : 'pending'),
        'desc': request.status == RequestStatus.completed
            ? 'Service confirmed as successful.'
            : (request.status == RequestStatus.disputed ? 'Service reported as incomplete.' : 'Agent is fulfilling your request.'),
      },
      if (request.status == RequestStatus.disputed || request.status == RequestStatus.completed)
        {
          'label': 'Resolution',
          'date': request.status == RequestStatus.completed ? 'Settled' : 'Under Review',
          'status': request.status == RequestStatus.completed ? 'completed' : 'current',
          'desc': request.status == RequestStatus.completed
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
              subtitle: 'ID: #${request.id}',
              onActionTap: onClose,
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
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.offWhite),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.charcoal.withValues(alpha: 0.05),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                request.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: AppColors.charcoal,
                                ),
                              ),
                              _StatusBadge(status: request.status),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(
                                Icons.location_on,
                                size: 14,
                                color: AppColors.mediumGrey,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                request.location,
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
                    const SizedBox(height: 24),

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
                                width: 40,
                                child: Column(
                                  children: [
                                    Container(
                                      width: 32,
                                      height: 32,
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
                                          width: 2,
                                        ),
                                        boxShadow: [
                                          if (isCurrent)
                                            BoxShadow(
                                              color: AppColors.successGreen
                                                  .withValues(alpha: 0.4),
                                              blurRadius: 8,
                                            ),
                                        ],
                                      ),
                                      child: Icon(
                                        isCompleted
                                            ? Icons.check
                                            : (isCurrent
                                                  ? Icons.access_time
                                                  : Icons.circle_outlined),
                                        size: 16,
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
                                          color: AppColors.softGrey,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(bottom: 28),
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
                                      const SizedBox(height: 4),
                                      Text(
                                        step['desc'] as String,
                                        style: const TextStyle(
                                          color: AppColors.darkGrey,
                                          fontSize: 14,
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

                    const SizedBox(height: 24),
                    // Confirmation Section (Only for Fulfilled)
                    if (request.status == RequestStatus.fulfilled) ...[
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.brandPrimary.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: AppColors.brandPrimary.withValues(alpha: 0.1),
                          ),
                        ),
                        child: Column(
                          children: [
                            const Row(
                              children: [
                                Icon(
                                  Icons.verified_user_outlined,
                                  color: AppColors.brandPrimary,
                                  size: 24,
                                ),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    'Confirm Fulfillment',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
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
                                fontSize: 13,
                                height: 1.5,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                // Dispute Button
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: isProcessing.value ? null : () async {
                                      isProcessing.value = true;
                                      try {
                                        await ref.read(customerRequestsProvider.notifier).confirmFulfillment(request.id, false);
                                      } finally {
                                        isProcessing.value = false;
                                      }
                                    },
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      side: const BorderSide(color: AppColors.errorRed),
                                      foregroundColor: AppColors.errorRed,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    child: const Text('Dispute'),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                // Confirm Button
                                Expanded(
                                  flex: 2,
                                  child: ElevatedButton(
                                    onPressed: isProcessing.value ? null : () async {
                                      isProcessing.value = true;
                                      try {
                                        await ref.read(customerRequestsProvider.notifier).confirmFulfillment(request.id, true);
                                      } finally {
                                        isProcessing.value = false;
                                      }
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.successGreen,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    child: isProcessing.value 
                                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                      : const Text('Yes, it\'s done', style: TextStyle(fontWeight: FontWeight.bold)),
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
                      height: 54,
                      child: request.status == RequestStatus.completed 
                        ? ElevatedButton.icon(
                            onPressed: () {
                              context.push(
                                '/feedback',
                                extra: {
                                  'requestId': request.id,
                                  'recipientName': request.assignedAgentName ?? 'Assigned Agent',
                                  'role': UserRole.customer,
                                },
                              );
                            },
                            icon: const Icon(Icons.star_outline, size: 20),
                            label: const Text('Leave Feedback', style: TextStyle(fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.brandPrimary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          )
                        : OutlinedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.message_outlined, size: 18),
                            label: const Text('Contact Agent'),
                            style: OutlinedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              foregroundColor: AppColors.brandPrimary,
                              side: const BorderSide(color: AppColors.brandPrimary),
                            ),
                          ),
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
