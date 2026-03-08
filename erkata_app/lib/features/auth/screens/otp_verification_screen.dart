import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:styled_widget/styled_widget.dart';
import '../../../core/theme/colors.dart';
import '../../../core/models/user_role.dart';
import '../state/auth_provider.dart';
import '../../../shared/widgets/primary_button.dart';

class OtpVerificationScreen extends HookConsumerWidget {
  final UserRole role;

  const OtpVerificationScreen({required this.role, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Generate 4 controllers for 4 digits
    final controllers = List.generate(4, (_) => useTextEditingController());
    final focusNodes = List.generate(4, (_) => useFocusNode());

    void handleVerify() {
      final otp = controllers.map((c) => c.text).join();
      if (otp.length == 4) {
        // Mock verification
        ref.read(authProvider.notifier).login(role);
        if (role == UserRole.customer) {
          context.go('/home');
        } else {
          context.go('/agent');
        }
      }
    }

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: SafeArea(
        child:
            Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Icon
                    const Icon(
                          Icons.shield_outlined,
                          color: AppColors.primaryNavy,
                          size: 32,
                        )
                        .center()
                        .backgroundColor(AppColors.primaryNavy.withOpacity(0.1))
                        .constrained(width: 64, height: 64)
                        .clipOval(),
                    const SizedBox(height: 24),

                    // Title
                    const Text(
                      'Verify Code',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryNavy,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Enter the 4-digit code sent to your phone',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey[600], fontSize: 14),
                    ),
                    const SizedBox(height: 32),

                    // OTP Inputs
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: List.generate(
                        4,
                        (index) => TextField(
                          controller: controllers[index],
                          focusNode: focusNodes[index],
                          textAlign: TextAlign.center,
                          keyboardType: TextInputType.number,
                          maxLength: 1,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                          decoration: InputDecoration(
                            counterText: '',
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.grey[300]!),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: AppColors.primaryNavy,
                                width: 2,
                              ),
                            ),
                            filled: true,
                            fillColor: Colors.white,
                          ),
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
                        ).constrained(width: 60),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Action Buttons
                    PrimaryButton(
                      text: 'Verify',
                      onPressed: handleVerify,
                      icon: Icons.check_circle_outline,
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: () {
                        // Simulation
                      },
                      child: const Text(
                        'Resend Code',
                        style: TextStyle(
                          color: AppColors.primaryNavy,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Back to Login
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.arrow_back,
                          size: 16,
                          color: Colors.grey[500],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Back to Login',
                          style: TextStyle(
                            color: Colors.grey[500],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ).gestures(onTap: () => context.pop()),
                  ],
                )
                .padding(horizontal: 24, vertical: 24)
                .constrained(maxWidth: 400)
                .center(),
      ),
    );
  }
}
