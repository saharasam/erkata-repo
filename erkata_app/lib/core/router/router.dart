import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/state/auth_provider.dart';
import '../../core/models/user_role.dart';
import '../../features/auth/screens/auth_screen.dart';
import '../../features/customer/screens/home_screen.dart';
import '../../features/customer/screens/request_intake_screen.dart';
import '../../features/customer/screens/request_status_screen.dart';

import '../../features/customer/screens/profile_screen.dart';
import '../../features/agent/screens/agent_dashboard_screen.dart';
import '../../features/agent/screens/agent_subscription_screen.dart';
import '../../features/agent/screens/agent_commission_screen.dart';
import '../../features/agent/screens/agent_communication_screen.dart';
import '../../features/agent/screens/agent_profile_screen.dart';
import '../../features/agent/screens/agent_history_screen.dart';
import '../../features/agent/screens/agent_request_detail_screen.dart';
import '../../features/agent/screens/agent_business_verification_screen.dart';
import '../../features/agent/screens/agent_payout_settings_screen.dart';
import '../../core/models/service_request.dart';
import '../../features/auth/screens/otp_verification_screen.dart';
import '../../core/components/scaffold_with_nav_bar.dart';
import '../../features/customer/screens/settings_screen.dart';
import '../../features/customer/screens/notifications_screen.dart';
import '../../shared/screens/about_screen.dart';
import '../../shared/screens/contact_screen.dart';
import '../../shared/screens/privacy_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../shared/screens/terms_screen.dart';
import '../../shared/screens/feedback_form_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final authState = ref.watch(authProvider);

      // Wait for hydration before making routing decisions
      if (!authState.isHydrated) return null;

      final path = state.uri.toString();
      final isLoggingIn = path.startsWith('/auth');
      final isIntake = path.startsWith('/request/new');
      final isSplash = path == '/';

      // 1. Unauthenticated users
      if (!authState.isAuthenticated) {
        // Allow access to auth and intake flow
        if (isLoggingIn || isIntake) return null;
        // Everything else redirects to intake (Intake-First flow)
        return '/request/new';
      }

      // 2. Authenticated users
      // If an authenticated user tries to go to Login or Splash, send them to their dashboard
      // Note: We allow them to go to /request/new intentionally.
      if (isLoggingIn || isSplash) {
        final role = authState.user?.role;
        return role == 'agent' ? '/agent' : '/home';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
      GoRoute(
        path: '/auth',
        builder: (context, state) => const AuthScreen(),
        routes: [
          GoRoute(
            path: 'otp',
            builder: (context, state) {
              // Accept both old format (UserRole extra) and new format (Map extra)
              final extra = state.extra;
              if (extra is Map<String, dynamic>) {
                final role = extra['role'] as UserRole? ?? UserRole.customer;
                final email = extra['email'] as String?;
                final password = extra['password'] as String?;
                return OtpVerificationScreen(
                  role: role,
                  email: email,
                  password: password,
                );
              }
              // Fallback for old-style navigation
              final role = extra as UserRole? ?? UserRole.customer;
              return OtpVerificationScreen(role: role);
            },
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) {
          return ScaffoldWithNavBar(
            location: state.uri.toString(),
            child: child,
          );
        },
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/agent',
            builder: (context, state) => const AgentDashboardScreen(),
            routes: [
              GoRoute(
                path: 'subscription',
                builder: (context, state) => const AgentSubscriptionScreen(),
              ),
              GoRoute(
                path: 'commission',
                builder: (context, state) => const AgentCommissionScreen(),
              ),
              GoRoute(
                path: 'communication',
                builder: (context, state) => const AgentCommunicationScreen(),
              ),
              GoRoute(
                path: 'profile',
                builder: (context, state) => const AgentProfileScreen(),
              ),
              GoRoute(
                path: 'history',
                builder: (context, state) => const AgentHistoryScreen(),
              ),
              GoRoute(
                path: 'request/:id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  final req = state.extra as ServiceRequest?;
                  return AgentRequestDetailScreen(requestId: id, request: req);
                },
              ),
              GoRoute(
                path: 'business',
                builder: (context, state) =>
                    const AgentBusinessVerificationScreen(),
              ),
              GoRoute(
                path: 'payout',
                builder: (context, state) => const AgentPayoutSettingsScreen(),
              ),
              // Reuse customer settings screen for now
              GoRoute(
                path: 'settings',
                builder: (context, state) => const SettingsScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/request/status',
            builder: (context, state) => const RequestStatusScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationsScreen(),
          ),
          GoRoute(
            path: '/about',
            builder: (context, state) => const AboutScreen(),
          ),
          GoRoute(
            path: '/contact',
            builder: (context, state) => const ContactScreen(),
          ),
          GoRoute(
            path: '/privacy',
            builder: (context, state) => const PrivacyScreen(),
          ),
          GoRoute(
            path: '/terms',
            builder: (context, state) => const TermsScreen(),
          ),
          GoRoute(
            path: '/feedback',
            builder: (context, state) {
              final extra = state.extra as Map<String, dynamic>;
              return FeedbackFormScreen(
                requestId: extra['requestId'],
                recipientName: extra['recipientName'],
                role: extra['role'],
              );
            },
          ),
        ],
      ),
      // Request Intake is full screen, so outside the shell
      GoRoute(
        path: '/request/new',
        builder: (context, state) => const RequestIntakeScreen(),
      ),
    ],
  );
});
