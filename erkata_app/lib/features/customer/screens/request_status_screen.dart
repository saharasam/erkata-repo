import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:erkata_app/core/constants/constants.dart';
import 'package:erkata_app/core/models/request_status.dart';
import 'package:erkata_app/core/models/service_request.dart';
import 'package:erkata_app/core/models/request_type.dart';
import 'package:erkata_app/core/theme/colors.dart';
import 'package:erkata_app/shared/widgets/erkata_screen_header.dart';
import 'package:go_router/go_router.dart';

class RequestStatusScreen extends HookWidget {
  const RequestStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 8,
                ),
                itemCount: mockRequests.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final req = mockRequests[index];

                  // Simple filter logic for mock data
                  if (selectedFilter.value != 'All') {
                    if (req.status.label.toLowerCase() !=
                        selectedFilter.value.toLowerCase()) {
                      return const SizedBox.shrink();
                    }
                  }

                  return _RequestCard(
                    request: req,
                    onTap: () => selectedRequest.value = req,
                  );
                },
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
    final imageUrl = request.type == RequestType.property
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
      case RequestStatus.newRequest:
        bg = AppColors.infoBlueLight;
        text = AppColors.brandPrimary;
      case RequestStatus.assigned:
        bg = AppColors.warningOrangeLight;
        text = AppColors.warningOrange;
      case RequestStatus.inProgress:
        bg = AppColors.successGreen.withValues(alpha: 0.1);
        text = AppColors.successGreen;
      case RequestStatus.fulfilled:
        bg = AppColors.successGreen;
        text = AppColors.pureWhite;
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

class _RequestDetailView extends StatelessWidget {
  final ServiceRequest request;
  final VoidCallback onClose;

  const _RequestDetailView({required this.request, required this.onClose});

  @override
  Widget build(BuildContext context) {
    final steps = [
      {
        'label': 'Request Submitted',
        'date': 'Oct 24, 10:00 AM',
        'status': 'completed',
        'desc': 'Your request has been received.',
      },
      {
        'label': 'Agent Assigned',
        'date': 'Oct 24, 02:30 PM',
        'status': 'completed',
        'desc': 'Dawit M. is handling your case.',
      },
      {
        'label': 'Searching',
        'date': 'In Progress',
        'status': 'current',
        'desc': 'Agent is verifying availability.',
      },
      {
        'label': 'Fulfilled',
        'date': 'Pending',
        'status': 'pending',
        'desc': 'Items delivered / Contract signed.',
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
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: OutlinedButton.icon(
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
