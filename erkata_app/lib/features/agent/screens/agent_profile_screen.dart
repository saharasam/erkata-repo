import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../auth/state/auth_provider.dart';

class AgentProfileScreen extends ConsumerWidget {
  const AgentProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final menuItems = [
      {
        'icon': Icons.history,
        'label': 'History',
        'sub': 'View past requests',
        'route': '/agent/history',
      },
      {
        'icon': Icons.business,
        'label': 'Business Verification',
        'sub': 'Verify your business details',
        'route': null,
      },
      {
        'icon': Icons.account_balance_wallet,
        'label': 'Payout Settings',
        'sub': 'Manage your bank accounts',
        'route': null,
      },
      {
        'icon': Icons.notifications,
        'label': 'Notifications',
        'sub': 'Manage alerts',
        'route': '/agent/settings',
      }, // Linking to settings for now
      {
        'icon': Icons.security,
        'label': 'Security & Privacy',
        'sub': 'Password, 2FA',
        'route': '/agent/settings',
      },
      {
        'icon': Icons.help_outline,
        'label': 'Help & Support',
        'sub': 'FAQ, Contact Us',
        'route': '/agent/communication',
      },
    ];

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 100),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.only(
                top: 60,
                bottom: 30,
                left: 24,
                right: 24,
              ),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Theme.of(context).shadowColor.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(
                                context,
                              ).shadowColor.withValues(alpha: 0.3),
                              blurRadius: 10,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            'AG',
                            style: TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.onPrimary,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Theme.of(context).colorScheme.surface,
                              width: 4,
                            ),
                          ),
                          child: Icon(
                            Icons.edit,
                            size: 14,
                            color: Theme.of(context).colorScheme.onPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Agent Dawit',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    'dawit@addishome.com',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _Badge(
                        text: 'Verified Agent',
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.greenAccent
                            : AppColors.successGreen,
                        bgColor: Theme.of(context).brightness == Brightness.dark
                            ? AppColors.successGreenLight.withValues(alpha: 0.1)
                            : AppColors.successGreenLight,
                      ),
                      const SizedBox(width: 12),
                      _Badge(
                        text: 'Top Rated',
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.orangeAccent
                            : AppColors.warningOrange,
                        bgColor: Theme.of(context).brightness == Brightness.dark
                            ? AppColors.warningOrange.withValues(alpha: 0.1)
                            : AppColors.peachBg,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Menu Options
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  ...menuItems.map(
                    (item) => _MenuItem(
                      icon: item['icon'] as IconData,
                      label: item['label'] as String,
                      sub: item['sub'] as String,
                      onTap: () {
                        final route = item['route'] as String?;
                        if (route != null) {
                          context.push(route);
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Logout
                  TextButton.icon(
                    onPressed: () {
                      ref.read(authProvider.notifier).logout();
                      context.go('/auth');
                    },
                    icon: Icon(
                      Icons.logout,
                      color: Theme.of(context).colorScheme.error,
                    ),
                    label: Text(
                      'Log Out',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                      backgroundColor: Theme.of(
                        context,
                      ).colorScheme.errorContainer,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      minimumSize: const Size(double.infinity, 50),
                    ),
                  ),

                  const SizedBox(height: 32),
                  Text(
                    'Version 1.0.2',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                      fontSize: 12,
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
}

class _Badge extends StatelessWidget {
  final String text;
  final Color color;
  final Color bgColor;

  const _Badge({
    required this.text,
    required this.color,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String sub;
  final VoidCallback? onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.sub,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Theme.of(
                      context,
                    ).colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    size: 20,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
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
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        sub,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  size: 18,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
