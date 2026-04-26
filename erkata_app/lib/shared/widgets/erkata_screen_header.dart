import 'package:flutter/material.dart';

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
    return Container(
      // Reduced margin and padding for a compact look
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: Theme.of(
          context,
        ).colorScheme.primaryContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  // Changed to titleLarge for smaller, balanced text
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 3), // Tighter gap
                Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          const SizedBox(width: 12),
          customAction ??
              Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: IconButton(
                  // Set smaller constraints to shrink the button footprint
                  constraints: const BoxConstraints(
                    maxHeight: 36,
                    maxWidth: 36,
                  ),
                  padding: EdgeInsets.zero,
                  onPressed: onActionTap,
                  icon: Icon(
                    actionIcon,
                    size: 20,
                    color: Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
              ),
        ],
      ),
    );
  }
}
