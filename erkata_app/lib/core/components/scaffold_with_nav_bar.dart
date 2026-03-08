import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/colors.dart';
import '../models/user_role.dart';
import '../../features/auth/state/auth_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ScaffoldWithNavBar extends ConsumerWidget {
  final Widget child;
  final String location;

  const ScaffoldWithNavBar({
    required this.child,
    required this.location,
    super.key,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final role = authState.role;

    // Don't show nav bar if no role (e.g. still loading or error state, though router should handle redirect)
    if (role == null) return child;

    return Scaffold(
      body: Stack(
        children: [
          child,
          Positioned(
            left: 24,
            right: 24,
            bottom: 24,
            child: _CustomBottomNavBar(role: role, currentLocation: location),
          ),
        ],
      ),
    );
  }
}

class _CustomBottomNavBar extends StatelessWidget {
  final UserRole role;
  final String currentLocation;

  const _CustomBottomNavBar({
    required this.role,
    required this.currentLocation,
  });

  @override
  Widget build(BuildContext context) {
    final List<_NavItem> items = role == UserRole.customer
        ? [
            _NavItem(
              path: '/home',
              icon: Icons.home_outlined,
              activeIcon: Icons.home,
              label: 'Home',
            ),
            _NavItem(
              path: '/request/status',
              icon: Icons.bar_chart_outlined, // Activity
              activeIcon: Icons.bar_chart,
              label: 'Activity',
            ),
            _NavItem(
              path: '/payment',
              icon: Icons.credit_card_outlined,
              activeIcon: Icons.credit_card,
              label: 'Pay',
            ),
            _NavItem(
              path: '/profile',
              icon: Icons.person_outline,
              activeIcon: Icons.person,
              label: 'Profile',
            ),
          ]
        : [
            _NavItem(
              path: '/agent',
              icon: Icons.grid_view, // LayoutDashboard
              activeIcon: Icons.grid_view_sharp,
              label: 'Feed',
            ),
            _NavItem(
              path: '/agent/commission',
              icon: Icons.trending_up,
              activeIcon: Icons.trending_up,
              label: 'Earnings',
            ),
            _NavItem(
              path: '/agent/subscription',
              icon: Icons.bolt_outlined,
              activeIcon: Icons.bolt,
              label: 'Plan',
            ),
            _NavItem(
              path: '/agent/communication',
              icon: Icons.phone_outlined,
              activeIcon: Icons.phone,
              label: 'Contact',
            ),
          ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(
          16,
        ), // Rounded-2xl in React (usually 16px)
        border: Border.all(color: Colors.grey[100]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13), // slightly lighter shadow
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: items.map((item) {
          // Check if current location starts with item path
          // For exact matches like /home, check equality.
          // For nested routes, one might need exact check or startsWith.
          // Given the router structure, let's stick to simple exact matching for now or robust check.
          // Note: exact match is better for tabs unless we have sub-routes that should keep tab active.
          // React logic: `isActive = currentView === item.view` => exact state match.
          // Here: check URL.
          final isActive = currentLocation == item.path;

          return _NavBarItem(
            item: item,
            isActive: isActive,
            onTap: () => context.go(item.path),
          );
        }).toList(),
      ),
    );
  }
}

class _NavItem {
  final String path;
  final IconData icon;
  final IconData activeIcon;
  final String label;

  _NavItem({
    required this.path,
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

class _NavBarItem extends StatelessWidget {
  final _NavItem item;
  final bool isActive;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.item,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Styling from React:
    // w-14 h-14 (56px)
    // rounded-xl (12px)
    // transition-all duration-200
    // Active: text-ethio-blue bg-ethio-blue/5
    // Inactive: text-gray-400 hover:text-gray-600 hover:bg-gray-50
    // Icon: size 24. Active stroke 2.5 (flutter doesn't do stroke width easily on icons, use weight or fill).
    // Text: text-[10px] font-medium tracking-wide mt-1

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: isActive ? AppColors.primaryNavyLight : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 1.0, end: isActive ? 1.05 : 1.0),
              duration: const Duration(milliseconds: 200),
              builder: (context, scale, child) {
                return Transform.scale(
                  scale: scale,
                  child: Icon(
                    isActive ? item.activeIcon : item.icon,
                    size: 24,
                    color: isActive ? AppColors.primaryNavy : Colors.grey[400],
                  ),
                );
              },
            ),
            // Label
            const SizedBox(height: 4),
            Text(
              item.label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.5,
                color: isActive ? AppColors.primaryNavy : Colors.grey[400],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
