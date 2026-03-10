import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/user_role.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/primary_button.dart';

class AuthScreen extends HookConsumerWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLogin = useState(true);
    final selectedRole = useState<UserRole>(UserRole.customer);
    final nameController = useTextEditingController();
    final phoneController = useTextEditingController();
    final passwordController = useTextEditingController();
    final confirmPasswordController = useTextEditingController();

    final isDark = Theme.of(context).brightness == Brightness.dark;

    void handleSubmit() {
      context.push('/auth/otp', extra: selectedRole.value);
    }

    return Scaffold(
      backgroundColor: isDark ? AppColors.deepNavy : AppColors.bgLight,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),

              // Logo mark
              _LogoMark(isDark: isDark),
              const SizedBox(height: 32),

              // Title + subtitle
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _TitleBlock(
                  key: ValueKey(isLogin.value),
                  title: isLogin.value ? 'Log in' : 'Create Account',
                  subtitle: isLogin.value
                      ? 'Enter your details to access your account\nand manage your services.'
                      : 'Create a new account to get started\non the Erkata platform.',
                  isDark: isDark,
                ),
              ),
              const SizedBox(height: 36),

              // Fields
              AnimatedSize(
                duration: const Duration(milliseconds: 280),
                curve: Curves.easeInOut,
                child: Column(
                  children: [
                    // Role selector — sign up only
                    if (!isLogin.value) ...[
                      _RoleSelector(
                        selectedRole: selectedRole.value,
                        onChanged: (r) => selectedRole.value = r,
                        isDark: isDark,
                      ),
                      const SizedBox(height: 14),
                      _InputField(
                        controller: nameController,
                        hint: 'Name',
                        icon: Icons.person_outline_rounded,
                        isDark: isDark,
                      ),
                      const SizedBox(height: 14),
                    ],

                    _InputField(
                      controller: phoneController,
                      hint: 'Phone or Email',
                      icon: Icons.alternate_email_rounded,
                      keyboardType: TextInputType.emailAddress,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 14),

                    _InputField(
                      controller: passwordController,
                      hint: 'Password',
                      icon: Icons.lock_outline_rounded,
                      isPassword: true,
                      isDark: isDark,
                    ),

                    if (!isLogin.value) ...[
                      const SizedBox(height: 14),
                      _InputField(
                        controller: confirmPasswordController,
                        hint: 'Confirm Password',
                        icon: Icons.lock_outline_rounded,
                        isPassword: true,
                        isDark: isDark,
                      ),
                    ],
                  ],
                ),
              ),

              // Remember me + Forgot (login only)
              if (isLogin.value) ...[
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    GestureDetector(
                      onTap: () {},
                      child: Text(
                        'Forgot Password',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? AppColors.goldDark
                              : AppColors.primaryNavy,
                        ),
                      ),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 32),

              // CTA
              PrimaryButton(
                text: isLogin.value ? 'Login' : 'Create Account',
                onPressed: handleSubmit,
              ),
              const SizedBox(height: 24),

              // Toggle
              Center(
                child: GestureDetector(
                  onTap: () => isLogin.value = !isLogin.value,
                  child: RichText(
                    text: TextSpan(
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark
                            ? AppColors.onDarkSecondary
                            : AppColors.slate,
                      ),
                      children: [
                        TextSpan(
                          text: isLogin.value
                              ? "Don't have an account? "
                              : 'Already have an account? ',
                        ),
                        TextSpan(
                          text: isLogin.value ? 'Sign Up here' : 'Sign In here',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: isDark
                                ? AppColors.goldDark
                                : AppColors.primaryNavy,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────
// Logo mark
// ──────────────────────────────────────────────

class _LogoMark extends StatelessWidget {
  final bool isDark;
  const _LogoMark({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.primaryGold,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            Icons.home_work_rounded,
            color: isDark ? AppColors.deepNavy : AppColors.pureWhite,
            size: 22,
          ),
        ),
        const SizedBox(width: 10),
        Text(
          'Erkata',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: isDark ? AppColors.onDarkPrimary : AppColors.charcoal,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }
}

// ──────────────────────────────────────────────
// Title block
// ──────────────────────────────────────────────

class _TitleBlock extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isDark;

  const _TitleBlock({
    super.key,
    required this.title,
    required this.subtitle,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w900,
            color: isDark ? AppColors.onDarkPrimary : AppColors.charcoal,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          subtitle,
          style: TextStyle(
            fontSize: 14,
            height: 1.5,
            color: isDark ? AppColors.onDarkSecondary : AppColors.slate,
          ),
        ),
      ],
    );
  }
}

// ──────────────────────────────────────────────
// Role selector
// ──────────────────────────────────────────────

class _RoleSelector extends StatelessWidget {
  final UserRole selectedRole;
  final ValueChanged<UserRole> onChanged;
  final bool isDark;

  const _RoleSelector({
    required this.selectedRole,
    required this.onChanged,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? AppColors.navy800 : AppColors.pureWhite;
    final shadow = isDark
        ? [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ]
        : [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ];

    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        boxShadow: shadow,
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          _RoleTab(
            label: 'Customer',
            icon: Icons.person_outline_rounded,
            isSelected: selectedRole == UserRole.customer,
            onTap: () => onChanged(UserRole.customer),
            isDark: isDark,
          ),
          _RoleTab(
            label: 'Agent',
            icon: Icons.work_outline_rounded,
            isSelected: selectedRole == UserRole.agent,
            onTap: () => onChanged(UserRole.agent),
            isDark: isDark,
          ),
        ],
      ),
    );
  }
}

class _RoleTab extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isDark;

  const _RoleTab({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 11),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryGold : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: isSelected
                    ? (isDark ? AppColors.deepNavy : AppColors.pureWhite)
                    : (isDark ? AppColors.onDarkSecondary : AppColors.slate),
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isSelected
                      ? (isDark ? AppColors.deepNavy : AppColors.pureWhite)
                      : (isDark ? AppColors.onDarkSecondary : AppColors.slate),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────
// Input field — neumorphic-style
// ──────────────────────────────────────────────

class _InputField extends HookWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final bool isPassword;
  final TextInputType? keyboardType;
  final bool isDark;

  const _InputField({
    required this.controller,
    required this.hint,
    required this.icon,
    this.isPassword = false,
    this.keyboardType,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final obscure = useState(isPassword);
    final isFocused = useState(false);

    final bg = isDark ? AppColors.navy800 : AppColors.pureWhite;
    final shadow = isDark
        ? [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.25),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ]
        : [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ];

    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        boxShadow: shadow,
        border: isFocused.value
            ? Border.all(color: AppColors.primaryGold, width: 1.5)
            : Border.all(color: Colors.transparent),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure.value,
        keyboardType: keyboardType,
        style: TextStyle(
          fontSize: 15,
          color: isDark ? AppColors.onDarkPrimary : AppColors.charcoal,
        ),
        onTap: () => isFocused.value = true,
        onTapOutside: (_) {
          isFocused.value = false;
          FocusScope.of(context).unfocus();
        },
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(
            fontSize: 14,
            color: isDark ? AppColors.onDarkDisabled : AppColors.mediumGrey,
          ),
          prefixIcon: Icon(
            icon,
            size: 20,
            color: isFocused.value
                ? AppColors.primaryGold
                : (isDark ? AppColors.onDarkSecondary : AppColors.mediumGrey),
          ),
          suffixIcon: isPassword
              ? GestureDetector(
                  onTap: () => obscure.value = !obscure.value,
                  child: Icon(
                    obscure.value
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    size: 20,
                    color: isDark
                        ? AppColors.onDarkSecondary
                        : AppColors.mediumGrey,
                  ),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 17,
          ),
        ),
      ),
    );
  }
}
