import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/user_role.dart';
import '../../../core/theme/colors.dart';
import '../state/auth_provider.dart';
import '../../../shared/widgets/primary_button.dart';

class OtpVerificationScreen extends HookConsumerWidget {
  final UserRole role;

  const OtpVerificationScreen({required this.role, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controllers = List.generate(4, (_) => useTextEditingController());
    final focusNodes = List.generate(4, (_) => useFocusNode());

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = isDark ? AppColors.deepNavy : AppColors.bgLight;
    final primaryText = isDark ? AppColors.onDarkPrimary : AppColors.charcoal;
    final secondaryText = isDark ? AppColors.onDarkSecondary : AppColors.slate;

    // Entrance animation
    final fadeController = useAnimationController(
      duration: const Duration(milliseconds: 600),
    )..forward();

    void handleVerify() {
      final otp = controllers.map((c) => c.text).join();
      if (otp.length == 4) {
        ref.read(authProvider.notifier).login(role);
        if (role == UserRole.customer) {
          context.go('/home');
        } else {
          context.go('/agent');
        }
      }
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
                    AppColors.primaryGold.withValues(
                      alpha: isDark ? 0.07 : 0.04,
                    ),
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

                          // Shield icon with gold glow
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: AppColors.primaryGold.withValues(
                                alpha: isDark ? 0.10 : 0.08,
                              ),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.primaryGold.withValues(
                                  alpha: isDark ? 0.3 : 0.2,
                                ),
                                width: 1.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primaryGold.withValues(
                                    alpha: isDark ? 0.15 : 0.10,
                                  ),
                                  blurRadius: 24,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.shield_outlined,
                              color: AppColors.primaryGold,
                              size: 36,
                            ),
                          ),
                          const SizedBox(height: 28),

                          // Title
                          Text(
                            'Verify Your Identity',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              color: primaryText,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Enter the 4-digit code\nsent to your phone number',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              color: secondaryText,
                              height: 1.5,
                            ),
                          ),
                          const SizedBox(height: 44),

                          // OTP Boxes
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(4, (index) {
                              return Padding(
                                padding: EdgeInsets.only(
                                  right: index < 3 ? 16 : 0,
                                ),
                                child: _OtpBox(
                                  controller: controllers[index],
                                  focusNode: focusNodes[index],
                                  isDark: isDark,
                                  onChanged: (value) {
                                    if (value.isNotEmpty && index < 3) {
                                      focusNodes[index + 1].requestFocus();
                                    } else if (value.isEmpty && index > 0) {
                                      focusNodes[index - 1].requestFocus();
                                    }
                                    if (index == 3 && value.isNotEmpty) {
                                      handleVerify();
                                    }
                                  },
                                ),
                              );
                            }),
                          ),
                          const SizedBox(height: 44),

                          // Verify button
                          PrimaryButton(
                            text: 'Verify & Continue',
                            onPressed: handleVerify,
                            icon: Icons.arrow_forward_rounded,
                          ),
                          const SizedBox(height: 24),

                          // Resend
                          GestureDetector(
                            onTap: () {},
                            child: RichText(
                              text: TextSpan(
                                style: TextStyle(
                                  fontSize: 14,
                                  color: secondaryText,
                                ),
                                children: [
                                  const TextSpan(
                                    text: "Didn't receive a code? ",
                                  ),
                                  const TextSpan(
                                    text: 'Resend',
                                    style: TextStyle(
                                      color: AppColors.primaryGold,
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
// OTP Box
// ────────────────────────────────────────────────────────

class _OtpBox extends HookWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final bool isDark;

  const _OtpBox({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final isFocused = useState(false);

    useEffect(() {
      void listener() => isFocused.value = focusNode.hasFocus;
      focusNode.addListener(listener);
      return () => focusNode.removeListener(listener);
    }, [focusNode]);

    final bg = isDark ? AppColors.inputDark : AppColors.smokeWhite;
    final border = isDark ? AppColors.borderDark : AppColors.borderColor;
    final textColor = isDark ? AppColors.onDarkPrimary : AppColors.charcoal;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: 64,
      height: 68,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isFocused.value ? AppColors.primaryGold : border,
          width: isFocused.value ? 2 : 1,
        ),
        boxShadow: isFocused.value
            ? [
                BoxShadow(
                  color: AppColors.primaryGold.withValues(
                    alpha: isDark ? 0.12 : 0.08,
                  ),
                  blurRadius: 16,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: isFocused.value ? AppColors.primaryGold : textColor,
        ),
        decoration: const InputDecoration(
          counterText: '',
          border: InputBorder.none,
          contentPadding: EdgeInsets.zero,
        ),
        onChanged: onChanged,
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
