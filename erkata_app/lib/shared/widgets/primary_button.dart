import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';

class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isEnabled;
  final IconData? icon;

  final Color? backgroundColor;
  final Color? textColor;
  final double? height;
  final double? width;

  const PrimaryButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isEnabled = true,
    this.icon,
    this.backgroundColor,
    this.textColor,
    this.height = 56,
    this.width = double.infinity,
  });

  @override
  Widget build(BuildContext context) {
    final bool effectiveEnabled = isEnabled && !isLoading && onPressed != null;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeInOut,
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: effectiveEnabled && backgroundColor == null
            ? AppColors.goldGradient
            : null,
        color: !effectiveEnabled
            ? AppColors.mediumGrey.withValues(alpha: 0.3)
            : (backgroundColor ?? AppColors.primaryGold),
        boxShadow: effectiveEnabled
            ? [
                BoxShadow(
                  color: (backgroundColor ?? AppColors.primaryGold).withValues(
                    alpha: 0.3,
                  ),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: effectiveEnabled ? onPressed : null,
          borderRadius: BorderRadius.circular(16),
          splashColor: Colors.white24,
          highlightColor: Colors.white10,
          child: Center(
            child: isLoading
                ? const SizedBox(
                    height: 24,
                    width: 24,
                    child: CircularProgressIndicator(
                      color: AppColors.primaryNavy,
                      strokeWidth: 3,
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        text,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: effectiveEnabled
                              ? (textColor ?? AppColors.primaryNavy)
                              : AppColors.primaryNavy.withValues(alpha: 0.7),
                          letterSpacing: 0.5,
                        ),
                      ),
                      if (icon != null) ...[
                        const SizedBox(width: 10),
                        Icon(
                          icon,
                          size: 20,
                          color: effectiveEnabled
                              ? (textColor ?? AppColors.primaryNavy)
                              : AppColors.primaryNavy.withValues(alpha: 0.7),
                        ),
                      ],
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
