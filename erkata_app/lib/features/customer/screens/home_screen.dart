import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:erkata_app/core/models/request_status.dart';
import 'package:erkata_app/core/models/user_role.dart';
import 'package:erkata_app/core/theme/colors.dart';
import 'package:erkata_app/shared/widgets/erkata_screen_header.dart';
import '../state/customer_requests_provider.dart';

class HomeScreen extends HookConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(customerRequestsProvider);

    return Scaffold(
      floatingActionButton: const Padding(
        padding: EdgeInsets.only(bottom: 90),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => ref.read(customerRequestsProvider.notifier).refresh(),
          child: Column(
            children: [
              ErkataScreenHeader(
                title: 'Selam, Abebe ',
                subtitle: 'Find your perfect home or furniture.',
                actionIcon: Icons.person,
                onActionTap: () => context.push('/profile'),
              ),
              Expanded(
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.only(left: 20, right: 20, bottom: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 32),

                      // Banner
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.brandPrimary.withAlpha(77),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'New Listings in Bole',
                              style: TextStyle(
                                color: AppColors.pureWhite,
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Explore premium apartments available now.',
                              style: TextStyle(
                                color: AppColors.brandGoldLight,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 6),
                            ElevatedButton(
                              onPressed: () {
                                context.push('/request/new');
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.brandGold,
                                foregroundColor: AppColors.brandPrimary,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 12,
                                ),
                              ),
                              child: const Text(
                                'Start Request',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 22),

                      // Recent Requests Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Recent Requests',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.onSurface,
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              context.go('/request/status');
                            },
                            style: TextButton.styleFrom(
                              foregroundColor: AppColors.brandPrimary,
                            ),
                            child: const Row(
                              children: [
                                Text('View All'),
                                SizedBox(width: 4),
                                Icon(Icons.arrow_forward, size: 16),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Requests List
                      requestsAsync.when(
                        data: (requests) {
                          if (requests.isEmpty) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(40.0),
                                child: Text('No requests yet. Start your first one above!'),
                              ),
                            );
                          }
                          return ListView.separated(
                            physics: const NeverScrollableScrollPhysics(),
                            shrinkWrap: true,
                            itemCount: requests.length,
                            separatorBuilder: (context, index) =>
                                const SizedBox(height: 16),
                            itemBuilder: (context, index) {
                              final request = requests[index];
                              return Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: () {
                                    if (request.status == RequestStatus.fulfilled) {
                                      context.push(
                                        '/feedback',
                                        extra: {
                                          'requestId': request.id,
                                          'recipientName': 'Assigned Agent',
                                          'role': UserRole.customer,
                                        },
                                      );
                                    } else {
                                      context.push('/request/status');
                                    }
                                  },
                                  borderRadius: BorderRadius.circular(16),
                                  child: Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).colorScheme.surface,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: Theme.of(
                                          context,
                                        ).colorScheme.outlineVariant,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Theme.of(context).colorScheme.shadow
                                              .withValues(alpha: 0.05),
                                          blurRadius: 5,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: 8,
                                                vertical: 4,
                                              ),
                                              decoration: BoxDecoration(
                                                color: _getStatusBackgroundColor(
                                                  context,
                                                  request.status,
                                                ),
                                                borderRadius: BorderRadius.circular(
                                                  8,
                                                ),
                                              ),
                                              child: Text(
                                                request.status.label.toUpperCase(),
                                                style: TextStyle(
                                                  color: _getStatusTextColor(
                                                    context,
                                                    request.status,
                                                  ),
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  letterSpacing: 0.5,
                                                ),
                                              ),
                                            ),
                                            Text(
                                              request.date,
                                              style: TextStyle(
                                                color: Theme.of(
                                                  context,
                                                ).colorScheme.onSurfaceVariant,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 12),
                                        Text(
                                          request.title,
                                          style: TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16,
                                            color: Theme.of(
                                              context,
                                            ).colorScheme.onSurface,
                                          ),
                                        ),
                                        const SizedBox(height: 12),
                                        Row(
                                          children: [
                                            Icon(
                                              Icons.location_on,
                                              size: 14,
                                              color: Theme.of(
                                                context,
                                              ).colorScheme.onSurfaceVariant,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              request.location,
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: Theme.of(
                                                  context,
                                                ).colorScheme.onSurfaceVariant,
                                              ),
                                            ),
                                            const Spacer(),
                                            Container(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: 8,
                                                vertical: 2,
                                              ),
                                              decoration: BoxDecoration(
                                                color: Colors.blue[50],
                                                borderRadius: BorderRadius.circular(
                                                  6,
                                                ),
                                              ),
                                              child: Text(
                                                request.budget,
                                                style: const TextStyle(
                                                  color: AppColors.brandPrimary,
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          );
                        },
                        loading: () => const Center(
                          child: Padding(
                            padding: EdgeInsets.all(20.0),
                            child: CircularProgressIndicator(),
                          ),
                        ),
                        error: (err, stack) => Center(
                          child: Text('Error: $err'),
                        ),
                      ),
                      const SizedBox(height: 120), // Fab spacing
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusBackgroundColor(BuildContext context, RequestStatus status) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    switch (status) {
      case RequestStatus.pending:
        return isDark
            ? Colors.blue.withValues(alpha: 0.1)
            : AppColors.infoBlueLight;
      case RequestStatus.assigned:
        return isDark
            ? Colors.orange.withValues(alpha: 0.1)
            : AppColors.warningOrangeLight;
      case RequestStatus.fulfilled:
        return isDark
            ? AppColors.successGreen.withValues(alpha: 0.2)
            : AppColors.successGreen;
      case RequestStatus.disputed:
        return isDark
            ? Colors.red.withValues(alpha: 0.1)
            : Colors.red.shade50;
    }
  }

  Color _getStatusTextColor(BuildContext context, RequestStatus status) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    switch (status) {
      case RequestStatus.pending:
        return isDark ? Colors.blue[300]! : AppColors.infoBlue;
      case RequestStatus.assigned:
        return isDark ? Colors.orange[300]! : AppColors.warningOrange;
      case RequestStatus.fulfilled:
        return isDark
            ? Colors.greenAccent
            : const Color.fromARGB(255, 189, 228, 191);
      case RequestStatus.disputed:
        return isDark ? Colors.red[300]! : Colors.red;
    }
  }
}
