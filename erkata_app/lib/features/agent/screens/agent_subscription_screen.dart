import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/erkata_screen_header.dart';
import '../data/repositories/agent_repository.dart';
import '../state/packages_provider.dart';
import '../../auth/state/auth_provider.dart';

class AgentSubscriptionScreen extends ConsumerWidget {
  const AgentSubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final packagesAsync = ref.watch(availablePackagesProvider);
    final user = ref.watch(authProvider).user;
    final currentTier = user?.tier ?? 'FREE';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ErkataScreenHeader(
              title: 'Subscription',
              subtitle: 'Manage your membership plan',
              onActionTap: () => context.pop(),
            ),
            Expanded(
              child: packagesAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.brandPrimary),
                ),
                error: (err, stack) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppColors.errorRed),
                      const SizedBox(height: 16),
                      Text('Error loading plans: $err'),
                      TextButton(
                        onPressed: () => ref.refresh(availablePackagesProvider),
                        child: const Text('Try Again'),
                      ),
                    ],
                  ),
                ),
                data: (packages) {
                  final currentPkg = packages.firstWhere(
                    (p) => p['name'] == currentTier,
                    orElse: () => null,
                  );

                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      // Current Plan Hero Section
                      _CurrentPlanHero(
                        tier: currentTier,
                        displayName: currentPkg?['displayName'] ?? currentTier,
                        referralSlots: currentPkg?['referralSlots'] ?? 0,
                        usedSlots: user?.referrals?.length ?? 0,
                      ),

                      const SizedBox(height: 40),

                      Row(
                        children: [
                          Container(
                            width: 4,
                            height: 20,
                            decoration: BoxDecoration(
                              color: AppColors.brandPrimary,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            'UPGRADE YOUR REACH',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.brandPrimary,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Filter out current tier and show upgrades
                      ...packages.where((p) => p['name'] != currentTier).map(
                        (pkg) => _PackageUpgradeCard(
                          pkg: pkg,
                          onUpgrade: () => _handleUpgrade(context, ref, pkg),
                        ),
                      ),
                      const SizedBox(height: 40),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleUpgrade(BuildContext context, WidgetRef ref, dynamic pkg) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Upgrade to ${pkg['displayName']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Get ${pkg['referralSlots']} referral slots and access to ${pkg['zoneLimit']} zones.'),
            const SizedBox(height: 16),
            Text(
              'Investment: ${pkg['price']} ETB',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Maybe later', style: TextStyle(color: AppColors.slate)),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8, bottom: 8),
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.brandPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Confirm Upgrade'),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ref.read(agentRepositoryProvider).purchasePackage(pkg['name']);
        await ref.read(authProvider.notifier).refreshProfile();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Welcome to ${pkg['displayName']} tier!'),
              backgroundColor: AppColors.successGreen,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to upgrade: ${e.toString()}'),
              backgroundColor: AppColors.errorRed,
            ),
          );
        }
      }
    }
  }
}

class _CurrentPlanHero extends StatelessWidget {
  final String tier;
  final String displayName;
  final int referralSlots;
  final int usedSlots;

  const _CurrentPlanHero({
    required this.tier,
    required this.displayName,
    required this.referralSlots,
    required this.usedSlots,
  });

  @override
  Widget build(BuildContext context) {
    final progress = referralSlots > 0 ? (usedSlots / referralSlots).clamp(0.0, 1.0) : 0.0;
    final gradient = _getGradientForTier(tier);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: _getTierColor(tier).withValues(alpha: 0.3),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                ),
                child: const Text(
                  'ACTIVE PLAN',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const Icon(Icons.verified_user, color: Colors.white, size: 24),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            displayName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your current agent standing in the network.',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Referral Network Growth',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              Text(
                '$usedSlots / ${referralSlots > 0 ? referralSlots : "∞"}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Stack(
            children: [
              Container(
                height: 10,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
              FractionallySizedBox(
                widthFactor: progress,
                child: Container(
                  height: 10,
                  decoration: BoxDecoration(
                    color: AppColors.brandGold,
                    borderRadius: BorderRadius.circular(5),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.brandGold.withValues(alpha: 0.5),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  LinearGradient _getGradientForTier(String tier) {
    switch (tier.toUpperCase()) {
      case 'UNITY':
      case 'ABUNDANT_LIFE':
        return const LinearGradient(
          colors: [AppColors.brandPrimary, AppColors.brandPrimaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      default:
        return AppColors.primaryGradient;
    }
  }

  Color _getTierColor(String tier) {
    switch (tier.toUpperCase()) {
      case 'UNITY':
        return AppColors.brandGold;
      case 'ABUNDANT_LIFE':
        return AppColors.brandPrimary;
      default:
        return AppColors.brandPrimary;
    }
  }
}

class _PackageUpgradeCard extends StatelessWidget {
  final dynamic pkg;
  final VoidCallback onUpgrade;

  const _PackageUpgradeCard({required this.pkg, required this.onUpgrade});

  @override
  Widget build(BuildContext context) {
    final String tierName = pkg['name'] ?? '';
    final bool isPremium = tierName == 'UNITY' || tierName == 'ABUNDANT_LIFE';

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
        border: isPremium
            ? Border.all(color: AppColors.brandGold.withValues(alpha: 0.3), width: 2)
            : Border.all(color: AppColors.borderColor),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          children: [
            if (isPremium)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 6),
                decoration: const BoxDecoration(
                  gradient: AppColors.goldGradient,
                ),
                child: const Center(
                  child: Text(
                    'RECOMMENDED FOR GROWTH',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        pkg['displayName'],
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: AppColors.brandPrimary,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.brandPrimaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${pkg['price']} ETB',
                          style: const TextStyle(
                            color: AppColors.brandPrimary,
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _TierFeatureItem(
                    icon: Icons.people_outline,
                    label: '${pkg['referralSlots']} Referral Slots',
                    subtitle: 'Expand your earning potential',
                  ),
                  const SizedBox(height: 16),
                  _TierFeatureItem(
                    icon: Icons.map_outlined,
                    label: '${pkg['zoneLimit']} Geographic Zones',
                    subtitle: 'Wider service area coverage',
                  ),
                  const SizedBox(height: 16),
                  _TierFeatureItem(
                    icon: Icons.bolt,
                    label: _getPriorityLabel(pkg['name']),
                    subtitle: 'Lead assignment priority',
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: onUpgrade,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isPremium ? AppColors.brandGold : AppColors.brandPrimary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'Select Plan',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getPriorityLabel(String? tier) {
    switch (tier?.toUpperCase()) {
      case 'PEACE':
        return 'Medium Priority';
      case 'LOVE':
        return 'High Priority';
      case 'UNITY':
        return 'Very High Priority';
      case 'ABUNDANT_LIFE':
        return 'Maximum Priority';
      default:
        return 'Low Priority';
    }
  }
}

class _TierFeatureItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;

  const _TierFeatureItem({
    required this.icon,
    required this.label,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.brandPrimary, size: 20),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: AppColors.brandPrimary,
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.slate,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

