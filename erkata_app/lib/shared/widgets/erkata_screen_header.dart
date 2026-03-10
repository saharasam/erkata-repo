import 'package:flutter/material.dart';
import 'package:erkata_app/core/theme/colors.dart';

/// A standardized screen header matching the HomeScreen & AgentDashboard design.
///
/// Features a bold 24px navy title, a grey subtitle, and a navy circle
/// action button (typically a back button or a profile avatar) on the right.
///
/// Usage:
/// ```dart
/// ErkataScreenHeader(
///   title: 'My Requests',
///   subtitle: 'Track your service requests',
///   onActionTap: () => context.pop(),
/// )
/// ```
class ErkataScreenHeader extends StatelessWidget {
  /// Primary title displayed in bold navy.
  final String title;

  /// Secondary subtitle displayed in grey below the title.
  final String subtitle;

  /// Icon shown inside the circle action button. Defaults to [Icons.arrow_back].
  final IconData actionIcon;

  /// Callback when the circle action button is tapped.
  final VoidCallback? onActionTap;

  /// Optional widget to replace the default circle action button entirely.
  /// If provided, [actionIcon] and [onActionTap] are ignored.
  final Widget? customAction;

  const ErkataScreenHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.actionIcon = Icons.arrow_back,
    this.onActionTap,
    this.customAction,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Title block
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 14,
                ),
              ),
            ],
          ),

          // Action button
          customAction ??
              GestureDetector(
                onTap: onActionTap,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.charcoal.withValues(alpha: 0.12),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Icon(
                      actionIcon,
                      color: Theme.of(context).colorScheme.onPrimary,
                      size: 20,
                    ),
                  ),
                ),
              ),
        ],
      ),
    );
  }
}
