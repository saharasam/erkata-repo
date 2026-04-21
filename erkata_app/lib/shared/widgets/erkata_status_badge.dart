import 'package:flutter/material.dart';
import 'package:erkata_app/core/models/request_status.dart';
import 'package:erkata_app/core/theme/colors.dart';

/// A standardized status badge for service requests.
///
/// Uses the platform's [AppColors] palette and a pill shape.
/// Applied consistently in [HomeScreen] and [RequestStatusScreen].
///
/// Usage:
/// ```dart
/// ErkataStatusBadge(status: request.status)
/// ```
class ErkataStatusBadge extends StatelessWidget {
  final RequestStatus status;

  const ErkataStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (bg, text) = _resolveColors(context, status);

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

  (Color bg, Color text) _resolveColors(
    BuildContext context,
    RequestStatus status,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    switch (status) {
      case RequestStatus.pending:
        return (
          isDark
              ? AppColors.infoBlue.withValues(alpha: 0.2)
              : AppColors.infoBlueLight,
          isDark ? AppColors.infoBlueLight : AppColors.infoBlue,
        );
      case RequestStatus.assigned:
        return (
          isDark
              ? AppColors.warningOrange.withValues(alpha: 0.2)
              : AppColors.warningOrangeLight,
          isDark ? AppColors.warningOrangeLight : AppColors.warningOrange,
        );
      case RequestStatus.fulfilled:
        return (
          isDark
              ? AppColors.successGreen.withValues(alpha: 0.2)
              : AppColors.successGreenLight,
          isDark ? AppColors.successGreenLight : AppColors.successGreen,
        );
      case RequestStatus.disputed:
        return (
          isDark
              ? AppColors.errorRed.withValues(alpha: 0.2)
              : AppColors.errorRedLight,
          isDark ? AppColors.errorRedLight : AppColors.errorRed,
        );
      case RequestStatus.completed:
        return (
          isDark
              ? AppColors.successGreen.withValues(alpha: 0.2)
              : AppColors.successGreenLight,
          isDark ? AppColors.successGreenLight : AppColors.successGreen,
        );
    }
  }
}
