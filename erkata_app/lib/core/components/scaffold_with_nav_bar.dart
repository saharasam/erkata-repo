import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_role.dart';
import '../../features/auth/state/auth_provider.dart';

class ScaffoldWithNavBar extends ConsumerStatefulWidget {
  final Widget child;
  final String location;

  const ScaffoldWithNavBar({
    required this.child,
    required this.location,
    super.key,
  });

  @override
  ConsumerState<ScaffoldWithNavBar> createState() => _ScaffoldWithNavBarState();
}

class _ScaffoldWithNavBarState extends ConsumerState<ScaffoldWithNavBar> {
  bool _isVisible = true;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final roleStr = authState.user?.role;
    final UserRole role = switch (roleStr) {
      'agent' => UserRole.agent,
      _ => UserRole.customer,
    };

    // The nav bar is only visible on the main home pages for customers or agents
    final isHomePage =
        widget.location == '/home' || widget.location == '/agent';

    return Scaffold(
      body: NotificationListener<UserScrollNotification>(
        onNotification: (notification) {
          if (notification.direction == ScrollDirection.reverse) {
            if (_isVisible) setState(() => _isVisible = false);
          } else if (notification.direction == ScrollDirection.forward) {
            if (!_isVisible) setState(() => _isVisible = true);
          }
          return false;
        },
        child: Stack(
          children: [
            widget.child,
            if (isHomePage)
              AnimatedPositioned(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                left: 24,
                right: 24,
                bottom: _isVisible ? 24 : -100,
                child: _CustomBottomNavBar(
                  role: role,
                  currentLocation: widget.location,
                ),
              ),
          ],
        ),
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
              path: '/activity',
              icon: Icons.bar_chart_outlined,
              activeIcon: Icons.bar_chart,
              label: 'Activity',
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
              icon: Icons.grid_view,
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
              path: '/agent/referrals',
              icon: Icons.group_outlined,
              activeIcon: Icons.group,
              label: 'Referrals',
            ),
          ];

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).shadowColor.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: items.map((item) {
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
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: isActive
              ? Theme.of(
                  context,
                ).colorScheme.primaryContainer.withValues(alpha: 0.5)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 1.0, end: isActive ? 1.05 : 1.0),
              duration: const Duration(milliseconds: 200),
              builder: (context, scale, child) {
                return Transform.scale(
                  scale: scale,
                  child: Icon(
                    isActive ? item.activeIcon : item.icon,
                    size: 24,
                    color: isActive
                        ? Theme.of(context).colorScheme.primary
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                );
              },
            ),
            const SizedBox(height: 4),
            Text(
              item.label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                letterSpacing: 0.5,
                color: isActive
                    ? Theme.of(context).colorScheme.primary
                    : Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
