import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:erkata_app/core/models/request_status.dart';
import 'package:erkata_app/core/theme/colors.dart';
import 'package:erkata_app/shared/widgets/erkata_screen_header.dart';
import '../../auth/state/auth_provider.dart';
import '../state/customer_requests_provider.dart';

class HomeScreen extends HookConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(customerRequestsProvider);
    final authState = ref.watch(authProvider);
    final userName = authState.user?.fullName?.split(' ').first ?? 'User';

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () =>
              ref.read(customerRequestsProvider.notifier).refresh(),
          child: Column(
            children: [
              ErkataScreenHeader(
                title: 'Selam, $userName',
                subtitle: 'Find your perfect home or furniture.',
                actionIcon: Icons.person,
                onActionTap: () => context.push('/profile'),
              ),
              Expanded(
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.only(
                    left: 20,
                    right: 20,
                    bottom: 24,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 32),

                      // Hero Banner
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
                              'Looking for your perfect property?',
                              style: TextStyle(
                                color: AppColors.pureWhite,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Submit a request and let our network of top agents find it for you.',
                              style: TextStyle(
                                color: AppColors.pureWhite.withAlpha(200),
                                fontSize: 14,
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 20),
                            ElevatedButton(
                              onPressed: () => context.push('/request/new'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.brandGold,
                                foregroundColor: AppColors.brandPrimary,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 14,
                                ),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.add_home_work_rounded, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Start Request',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                ],
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
                              context.go('/activity');
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
                                child: Text(
                                  'No requests yet. Start your first one above!',
                                ),
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
                                  onTap: () => context.push('/request/status', extra: request),
                                  borderRadius: BorderRadius.circular(20),
                                  child: Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      color: Theme.of(
                                        context,
                                      ).colorScheme.surface,
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .outlineVariant
                                            .withAlpha(100),
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.brandPrimary
                                              .withAlpha(12),
                                          blurRadius: 15,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 4,
                                                  ),
                                              decoration: BoxDecoration(
                                                color:
                                                    _getStatusBackgroundColor(
                                                      context,
                                                      request.status,
                                                    ),
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                request.status.label
                                                    .toUpperCase(),
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
                                              Icons.location_on_outlined,
                                              size: 16,
                                              color: Theme.of(
                                                context,
                                              ).colorScheme.onSurfaceVariant,
                                            ),
                                            const SizedBox(width: 4),
                                            Expanded(
                                              child: Text(
                                                request.location,
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  color: Theme.of(
                                                    context,
                                                  ).colorScheme.onSurfaceVariant,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 10,
                                                    vertical: 4,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: AppColors.brandPrimary
                                                    .withAlpha(15),
                                                borderRadius:
                                                    BorderRadius.circular(8),
                                              ),
                                              child: Text(
                                                request.budget,
                                                style: const TextStyle(
                                                  color: AppColors.brandPrimary,
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w600,
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
                        error: (err, stack) =>
                            Center(child: Text('Error: $err')),
                      ),
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
        return isDark ? Colors.red.withValues(alpha: 0.1) : Colors.red.shade50;
      case RequestStatus.completed:
        return isDark
            ? AppColors.successGreen.withValues(alpha: 0.2)
            : AppColors.successGreenLight;
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
      case RequestStatus.completed:
        return isDark ? Colors.greenAccent : AppColors.successGreen;
    }
  }
}
