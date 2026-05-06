import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';

class ErkataScreenHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData actionIcon;
  final VoidCallback? onActionTap;
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
    // SafeArea prevents the card from hitting the clock/status bar area.
    return SafeArea(
      bottom: false,
      child: Padding(
        // The outer padding creates the "Floating" look by pulling the card
        // away from the edges of the phone screen.
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.brandPrimary,
            // A stadium-style corner (large radius) makes the app feel friendly.
            borderRadius: BorderRadius.circular(24),
            // A soft, low-opacity shadow makes the card look like it is
            // physically sitting on top of the content.
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 15,
                spreadRadius: 1,
                offset: const Offset(0, 4),
              ),
            ],
            // A very faint border adds a crisp edge on white backgrounds.
            border: Border.all(
              color: AppColors.borderColor.withValues(alpha: 0.5),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              // The action button is contained in a soft grey circle.
              customAction ??
                  GestureDetector(
                    onTap:
                        onActionTap ??
                        () {
                          if (context.canPop()) {
                            context.pop();
                          }
                        },
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: const BoxDecoration(
                        color: AppColors.surfaceSecondary,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        actionIcon,
                        size: 18,
                        color: AppColors.brandPrimary,
                      ),
                    ),
                  ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Color.fromARGB(255, 214, 221, 232),
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: AppColors.mediumGrey,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              // A small "Sync" indicator can be placed here to show real-time status.
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.successGreen,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
