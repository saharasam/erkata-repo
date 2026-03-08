import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import '../../../core/theme/colors.dart';
import '../state/auth_provider.dart';

class SplashScreen extends HookConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 🔹 1. Entrance Fade-in Animation
    final fadeController = useAnimationController(
      duration: const Duration(milliseconds: 800),
    )..forward();

    // 🔹 3. Staggered Text Animations
    final textSlideController = useAnimationController(
      duration: const Duration(milliseconds: 600),
    )..forward();

    final textSlideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
          CurvedAnimation(
            parent: textSlideController,
            curve: Curves.easeOutCubic,
          ),
        );

    // 🔹 4. Smart Navigation with Auth State
    useEffect(() {
      final timer = Timer(const Duration(seconds: 3), () async {
        final authState = ref.read(authProvider);

        // Determine next route based on auth state
        final nextRoute = authState.isAuthenticated ? '/home' : '/auth';

        if (context.mounted) {
          context.go(nextRoute);
        }
      });

      return timer.cancel;
    }, const []);

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      body: Stack(
        children: [
          // 🔹 Subtle animated background gradient
          const _AnimatedBackground(),

          // 🔹 Main Content
          FadeTransition(
            opacity: fadeController,
            child: Center(
              child: Semantics(
                label: 'Gojo app loading',
                excludeSemantics: false,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // 🔹 Lottie Animated Logo (Blue House)
                    ExcludeSemantics(
                      child: Lottie.asset(
                        'assets/lottie/blue_house.json',
                        width: 280,
                        height: 280,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) =>
                            const _LogoWidget(),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // 🔹 Staggered Animated Text
                    SlideTransition(
                      position: textSlideAnimation,
                      child: const _BrandText(),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 🔹 Version info (minimalist)
          Positioned(
            left: 0,
            right: 0,
            bottom: 40,
            child: Center(
              child: Text(
                'v1.0.0',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withValues(alpha: 0.4),
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedBackground extends HookWidget {
  const _AnimatedBackground();

  @override
  Widget build(BuildContext context) {
    final controller = useAnimationController(
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);

    final alignmentAnimation = useAnimation(
      AlignmentTween(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).animate(
        CurvedAnimation(parent: controller, curve: Curves.easeInOutSine),
      ),
    );

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: alignmentAnimation,
          end: Alignment.center,
          colors: [
            AppColors.deepNavy,
            AppColors.deepNavy.withValues(alpha: 0.9),
            AppColors.primaryGold.withValues(alpha: 0.05),
          ],
          stops: const [0.0, 0.7, 1.0],
        ),
      ),
    );
  }
}

class _LogoWidget extends StatelessWidget {
  const _LogoWidget();

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      width: 180,
      height: 180,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) => Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(
          color: AppColors.primaryGold,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: AppColors.primaryGold.withValues(alpha: 0.4),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: const Icon(
          Icons.home_work_rounded,
          color: AppColors.deepNavy,
          size: 64,
        ),
      ),
    );
  }
}

class _BrandText extends StatelessWidget {
  const _BrandText();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text(
          'Gojo',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            letterSpacing: 1.2,
            height: 1.1,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Connecting you to home',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            color: Colors.white.withValues(alpha: 0.75),
            letterSpacing: 0.5,
            height: 1.4,
          ),
        ),
      ],
    );
  }
}
