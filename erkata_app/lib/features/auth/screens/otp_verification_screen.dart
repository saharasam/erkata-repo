import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/user_role.dart';
import '../../../core/theme/colors.dart';
import '../state/auth_provider.dart';
import '../data/models/login_request.dart';
import '../../../shared/widgets/primary_button.dart';

/// Post-registration "Check Your Email" confirmation screen.
///
/// After Supabase email confirmation, the user taps "I've Verified"
/// which attempts a login with the credentials passed via route extras.
class OtpVerificationScreen extends HookConsumerWidget {
  final UserRole role;
  final String? email;
  final String? password;

  const OtpVerificationScreen({
    required this.role,
    this.email,
    this.password,
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.deepNavy : AppColors.bgLight;
    final primaryText = isDark ? AppColors.onDarkPrimary : AppColors.charcoal;
    final secondaryText = isDark ? AppColors.onDarkSecondary : AppColors.slate;

    final authState = ref.watch(authProvider);

    // Entrance animation
    final fadeController = useAnimationController(
      duration: const Duration(milliseconds: 600),
    )..forward();

    // Listen for errors
    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next.errorMessage != null &&
          next.errorMessage != previous?.errorMessage) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
        ref.read(authProvider.notifier).clearError();
      }
    });

    Future<void> handleVerify() async {
      if (email != null && password != null) {
        await ref
            .read(authProvider.notifier)
            .login(LoginRequest(identifier: email!, password: password!));
        // Navigation is handled by router redirect when isAuthenticated becomes true
      }
    }

    void handleResend() {
      // Placeholder — requires a backend /auth/resend-confirmation endpoint
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Confirmation email resent'),
          backgroundColor: AppColors.brandGold,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: Stack(
        children: [
          // Subtle background glow
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.brandGold.withValues(alpha: isDark ? 0.07 : 0.04),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Main content
          SafeArea(
            child: FadeTransition(
              opacity: fadeController,
              child: Column(
                children: [
                  // Back button
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: Row(
                      children: [
                        _BackButton(onTap: () => context.pop(), isDark: isDark),
                      ],
                    ),
                  ),

                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(28, 16, 28, 32),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const SizedBox(height: 24),

                          // Email icon with gold glow
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: AppColors.brandGold.withValues(
                                alpha: isDark ? 0.10 : 0.08,
                              ),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.brandGold.withValues(
                                  alpha: isDark ? 0.3 : 0.2,
                                ),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.brandGold.withValues(
                                    alpha: isDark ? 0.15 : 0.10,
                                  ),
                                  blurRadius: 24,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.mark_email_read_outlined,
                              color: AppColors.brandGold,
                              size: 36,
                            ),
                          ),
                          const SizedBox(height: 28),

                          // Title
                          Text(
                            'Check Your Email',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: primaryText,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            email != null
                                ? 'We\'ve sent a confirmation link to\n$email'
                                : 'We\'ve sent a confirmation link\nto your email address',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              color: secondaryText,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Open the link in the email to verify\nyour account, then come back and\ntap the button below.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              color: secondaryText.withValues(alpha: 0.8),
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 44),

                          // Verify button
                          PrimaryButton(
                            text: authState.isLoading
                                ? 'Verifying…'
                                : 'I\'ve Verified — Continue',
                            onPressed: authState.isLoading
                                ? null
                                : handleVerify,
                            icon: Icons.arrow_forward_rounded,
                          ),
                          const SizedBox(height: 24),

                          // Resend
                          GestureDetector(
                            onTap: handleResend,
                            child: RichText(
                              text: TextSpan(
                                style: TextStyle(
                                  fontSize: 14,
                                  color: secondaryText,
                                ),
                                children: const [
                                  TextSpan(text: "Didn't receive an email? "),
                                  TextSpan(
                                    text: 'Resend',
                                    style: TextStyle(
                                      color: AppColors.brandGold,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ────────────────────────────────────────────────────────
// Back Button
// ────────────────────────────────────────────────────────

class _BackButton extends StatelessWidget {
  final VoidCallback onTap;
  final bool isDark;
  const _BackButton({required this.onTap, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? AppColors.navy800 : AppColors.pureWhite;
    final border = isDark ? AppColors.borderDark : AppColors.borderColor;
    final iconColor = isDark ? AppColors.onDarkPrimary : AppColors.charcoal;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: border),
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Icon(Icons.arrow_back_rounded, color: iconColor, size: 20),
      ),
    );
  }
}
