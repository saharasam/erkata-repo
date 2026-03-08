import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/models/user_role.dart';
import '../../../core/theme/colors.dart';

class AuthScreen extends HookConsumerWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLogin = useState(true);
    final selectedRole = useState<UserRole>(UserRole.customer);
    final isDarkMode = useState(false);

    final nameController = useTextEditingController();
    final phoneController = useTextEditingController();
    final passwordController = useTextEditingController();

    void handleLogin() {
      context.push('/auth/otp', extra: selectedRole.value);
    }

    final themeColor = isDarkMode.value
        ? AppColors.deepNavy
        : AppColors.bgLight;

    return Scaffold(
      backgroundColor: themeColor,
      body: Stack(
        children: [
          // 1. Background Image with Overlay
          Positioned.fill(
            child: Image.network(
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDoIyQfEJ7RK1NO9-8fW_vwbGxpM-vxiMVXESdDS_W-9ZlcSUc4U-dvKon1atDqwqbYKiPUPUTE17SmkXnfDCPheKXtjwQ4a0ab7sLcDhaLswEsj_I0s-pqmxg_HTZ0EkOhp2RchWVerOfnNIp9YYT8318w8ui459mE5SQwbzvlat5zqTPlxaY0fzywv_wLyIAK15Tex6W2WZna2elnPxsUJ_a2tLqmJz-O2O36DjXY3G69MGf2ZYFfeOGv6T-zy9jlD_IyQHlgP0H4',
              fit: BoxFit.cover,
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.deepNavy.withValues(alpha: 0.4),
                    AppColors.deepNavy.withValues(alpha: 0.1),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.4, 1.0],
                ),
              ),
            ),
          ),

          // 2. Branding Header
          Positioned(
            top: MediaQuery.of(context).padding.top + 40,
            left: 0,
            right: 0,
            child: const _AppLogo(),
          ),

          // 3. Theme Toggle
          // Positioned(
          //   top: MediaQuery.of(context).padding.top + 40,
          //   right: 16,
          //   child: GestureDetector(
          //     onTap: () => isDarkMode.value = !isDarkMode.value,
          //     child: Container(
          //       width: 40,
          //       height: 40,
          //       decoration: BoxDecoration(
          //         color: Colors.white.withValues(alpha: 0.2),
          //         shape: BoxShape.circle,
          //         border: Border.all(
          //           color: Colors.white.withValues(alpha: 0.3),
          //         ),
          //       ),
          //       child: Icon(
          //         isDarkMode.value ? Icons.light_mode : Icons.dark_mode,
          //         color: Colors.white,
          //         size: 20,
          //       ),
          //     ),
          //   ),
          // ),

          // 4. Bottom Sheet Form
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.72,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              decoration: BoxDecoration(
                color: themeColor,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(40),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 40,
                    offset: const Offset(0, -10),
                  ),
                ],
              ),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    // Handle
                    // Container(
                    //   width: 48,
                    //   height: 6,
                    //   decoration: BoxDecoration(
                    //     color: isDarkMode.value
                    //         ? Colors.white10
                    //         : Colors.black12,
                    //     borderRadius: BorderRadius.circular(3),
                    //   ),
                    // ),
                    const SizedBox(height: 32),

                    // Form Content (To be expanded in next step)
                    _AuthForm(
                      isLogin: isLogin.value,
                      isDarkMode: isDarkMode.value,
                      phoneController: phoneController,
                      passwordController: passwordController,
                      nameController: nameController,
                      selectedRole: selectedRole.value,
                      onRoleChanged: (role) => selectedRole.value = role,
                      onLoginToggle: () => isLogin.value = !isLogin.value,
                      onSumbit: handleLogin,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AuthForm extends StatelessWidget {
  final bool isLogin;
  final bool isDarkMode;
  final TextEditingController phoneController;
  final TextEditingController passwordController;
  final TextEditingController nameController;
  final UserRole selectedRole;
  final Function(UserRole) onRoleChanged;
  final VoidCallback onLoginToggle;
  final VoidCallback onSumbit;

  const _AuthForm({
    required this.isLogin,
    required this.isDarkMode,
    required this.phoneController,
    required this.passwordController,
    required this.nameController,
    required this.selectedRole,
    required this.onRoleChanged,
    required this.onLoginToggle,
    required this.onSumbit,
  });

  @override
  Widget build(BuildContext context) {
    final labelColor = isDarkMode ? Colors.white70 : const Color(0xFF475569);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Role Selection (Signup only)
        if (!isLogin) ...[
          Center(child: _AvatarPicker(onTap: () {})),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
            child: Text(
              'I am a...',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: labelColor,
              ),
            ),
          ),
          Row(
            children: [
              Expanded(
                child: _RoleButton(
                  label: 'Customer',
                  icon: Icons.person_outline,
                  isSelected: selectedRole == UserRole.customer,
                  isDarkMode: isDarkMode,
                  onTap: () => onRoleChanged(UserRole.customer),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _RoleButton(
                  label: 'Agent',
                  icon: Icons.work_outline,
                  isSelected: selectedRole == UserRole.agent,
                  isDarkMode: isDarkMode,
                  onTap: () => onRoleChanged(UserRole.agent),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _InputLabel(text: 'Full Name', isDarkMode: isDarkMode),
          const SizedBox(height: 8),
          _CustomInput(
            controller: nameController,
            hintText: 'Enter your name',
            isDarkMode: isDarkMode,
            icon: Icons.person_outline,
          ),
          const SizedBox(height: 16),
        ],

        _InputLabel(text: 'Phone or Email', isDarkMode: isDarkMode),
        const SizedBox(height: 8),
        _CustomInput(
          controller: phoneController,
          hintText: 'Enter your details',
          isDarkMode: isDarkMode,
          icon: Icons.alternate_email,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        Padding(
          padding: const EdgeInsets.only(right: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _InputLabel(text: 'Password', isDarkMode: isDarkMode),
              if (isLogin)
                GestureDetector(
                  onTap: () {},
                  child: const Text(
                    'Forgot Password?',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryGold,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        _CustomInput(
          controller: passwordController,
          hintText: '••••••••',
          isDarkMode: isDarkMode,
          icon: Icons.lock_open,
          isPassword: true,
        ),
        const SizedBox(height: 24),

        // Submit Button
        SizedBox(
          width: double.infinity,
          height: 56,
          child: ElevatedButton(
            onPressed: onSumbit,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGold,
              foregroundColor: AppColors.deepNavy,
              elevation: 4,
              shadowColor: AppColors.primaryGold.withValues(alpha: 0.4),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            child: Text(isLogin ? 'Sign In' : 'Sign Up'),
          ),
        ),
        const SizedBox(height: 24),

        // Divider
        Row(
          children: [
            Expanded(
              child: Divider(
                color: isDarkMode ? Colors.white12 : Colors.black12,
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'OR CONTINUE WITH',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: isDarkMode ? Colors.white38 : Colors.black38,
                ),
              ),
            ),
            Expanded(
              child: Divider(
                color: isDarkMode ? Colors.white12 : Colors.black12,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Social Buttons
        Row(
          children: [
            Expanded(
              child: _SocialButton(
                label: 'Google',
                iconPath:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDY4uHROWhgKcDH5R_a9gxmoaSgikR1aT7V_H9Vav88beBDDaGA2l4IIwUpM846R3rypJnJyehTsa2WioatmXPOmFQPoBenm4f2l_SNZGuRHaqw4vVAnUYcgBZASJArDEt-Yl3XCwWINvVCVCfyoWOrErsZY92VVUb0_oGvDr97Nx90zN6xPVpk4HCu9469wcwlN6bMIBKZJZjAZM4GdjgtJrlM4nYJX9wOS-BUU5kSzN25uQG7rH0SMh9AbGZTgsBJEd_hc6VFK3l0',
                isDarkMode: isDarkMode,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _SocialButton(
                label: 'Apple',
                iconPath:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAf9XlaZmLhdb1p-AJdj8yGp9SBWiJmxMnntG4s5gLw-igcWBxJURnLKTyTyF3xPFK9GNdZpcncpyUfeLFm8fqUg7MQmol0bp_8ehDbpm4NdRgc4fbScE6a8u3YRiu8mcVURXRQG67L45DDF9_E2bxsGL7sWgt1CWMxDDu3VHH8Nptkih1JvNIbMwZ3ekWle4hoVlEGnS_pEvxPLN62UHe1TkXICLWBtRI3-pAe8ifr8WQZ7bcEaFQu9hmEUmXlMxbL0o4XKTlq56PW',
                isDarkMode: isDarkMode,
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),

        // Footer
        Center(
          child: GestureDetector(
            onTap: onLoginToggle,
            child: RichText(
              text: TextSpan(
                style: TextStyle(
                  fontSize: 14,
                  color: isDarkMode ? Colors.white60 : Colors.black54,
                ),
                children: [
                  TextSpan(
                    text: isLogin
                        ? "Don't have an account? "
                        : "Already have an account? ",
                  ),
                  TextSpan(
                    text: isLogin ? 'Create Account' : 'Sign In',
                    style: const TextStyle(
                      color: AppColors.primaryGold,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _InputLabel extends StatelessWidget {
  final String text;
  final bool isDarkMode;
  const _InputLabel({required this.text, required this.isDarkMode});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: isDarkMode ? Colors.white70 : const Color(0xFF475569),
        ),
      ),
    );
  }
}

class _CustomInput extends HookWidget {
  final TextEditingController controller;
  final String hintText;
  final bool isDarkMode;
  final IconData icon;
  final bool isPassword;
  final TextInputType? keyboardType;

  const _CustomInput({
    required this.controller,
    required this.hintText,
    required this.isDarkMode,
    required this.icon,
    this.isPassword = false,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    final obscureText = useState(isPassword);
    final fieldColor = isDarkMode ? AppColors.navy800 : const Color(0xFFF1F5F9);

    return Container(
      decoration: BoxDecoration(
        color: fieldColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText.value,
        keyboardType: keyboardType,
        style: TextStyle(color: isDarkMode ? Colors.white : Colors.black87),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: TextStyle(
            color: isDarkMode ? Colors.white38 : Colors.black38,
          ),
          prefixIcon: Icon(
            icon,
            color: isDarkMode ? Colors.white38 : Colors.black38,
            size: 20,
          ),
          suffixIcon: isPassword
              ? GestureDetector(
                  onTap: () => obscureText.value = !obscureText.value,
                  child: Icon(
                    obscureText.value ? Icons.visibility_off : Icons.visibility,
                    color: isDarkMode ? Colors.white38 : Colors.black38,
                    size: 20,
                  ),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  final String label;
  final String iconPath;
  final bool isDarkMode;

  const _SocialButton({
    required this.label,
    required this.iconPath,
    required this.isDarkMode,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      decoration: BoxDecoration(
        color: isDarkMode ? AppColors.navy800 : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDarkMode ? Colors.white12 : Colors.black12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.network(
            iconPath,
            width: 20,
            height: 20,
            errorBuilder: (_, __, ___) => const SizedBox(),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isDarkMode ? Colors.white : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}

class _RoleButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final bool isDarkMode;
  final VoidCallback onTap;

  const _RoleButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.isDarkMode,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryGold
              : (isDarkMode ? AppColors.navy800 : const Color(0xFFF1F5F9)),
          borderRadius: BorderRadius.circular(16),
          border: isSelected
              ? null
              : Border.all(color: isDarkMode ? Colors.white12 : Colors.black12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected
                  ? AppColors.deepNavy
                  : (isDarkMode ? Colors.white70 : Colors.black54),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isSelected
                    ? AppColors.deepNavy
                    : (isDarkMode ? Colors.white70 : Colors.black54),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppLogo extends StatelessWidget {
  const _AppLogo();

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: 120,
      height: 120,
      fit: BoxFit.contain,
    );
  }
}

class _AvatarPicker extends StatelessWidget {
  final VoidCallback onTap;
  const _AvatarPicker({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.offWhite,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 4),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryNavy.withValues(alpha: 0.1),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(
            Icons.person,
            size: 40,
            color: AppColors.mediumGrey,
          ),
        ),
        Positioned(
          bottom: 0,
          right: 0,
          child: GestureDetector(
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: AppColors.primaryNavy,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.camera_alt,
                color: Colors.white,
                size: 16,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
