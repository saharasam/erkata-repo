import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  // Notification preferences
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _smsNotifications = false;
  bool _requestUpdates = true;
  bool _paymentAlerts = true;
  bool _promotionalMessages = false;

  // Security
  bool _twoFactorAuth = false;
  bool _biometricLogin = false;

  // Preferences
  String _selectedLanguage = 'English';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const ErkataScreenHeader(
              title: 'Settings',
              subtitle: 'Manage your preferences',
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Profile Section
                    _SectionHeader(title: 'Profile', icon: Icons.person),
                    const SizedBox(height: 12),
                    _SettingsCard(
                      children: [
                        _SettingsTile(
                          icon: Icons.person_outline,
                          title: 'Personal Information',
                          subtitle: 'Name, email, phone number',
                          onTap: () {},
                        ),
                        const Divider(height: 1),
                        _SettingsTile(
                          icon: Icons.location_on_outlined,
                          title: 'Address',
                          subtitle: 'Update your location',
                          onTap: () {},
                        ),
                        const Divider(height: 1),
                        _SettingsTile(
                          icon: Icons.camera_alt_outlined,
                          title: 'Profile Photo',
                          subtitle: 'Change your avatar',
                          onTap: () {},
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Notification Preferences
                    _SectionHeader(
                      title: 'Notifications',
                      icon: Icons.notifications_outlined,
                    ),
                    const SizedBox(height: 12),
                    _SettingsCard(
                      children: [
                        _ToggleTile(
                          title: 'Push Notifications',
                          subtitle: 'Receive push notifications',
                          value: _pushNotifications,
                          onChanged: (v) =>
                              setState(() => _pushNotifications = v),
                        ),
                        const Divider(height: 1),
                        _ToggleTile(
                          title: 'Email Notifications',
                          subtitle: 'Receive email updates',
                          value: _emailNotifications,
                          onChanged: (v) =>
                              setState(() => _emailNotifications = v),
                        ),
                        const Divider(height: 1),
                        _ToggleTile(
                          title: 'SMS Notifications',
                          subtitle: 'Receive text messages',
                          value: _smsNotifications,
                          onChanged: (v) =>
                              setState(() => _smsNotifications = v),
                        ),
                        const Divider(height: 1),
                        _ToggleTile(
                          title: 'Request Updates',
                          subtitle: 'Status changes on your requests',
                          value: _requestUpdates,
                          onChanged: (v) => setState(() => _requestUpdates = v),
                        ),
                        const Divider(height: 1),
                        _ToggleTile(
                          title: 'Payment Alerts',
                          subtitle: 'Payment confirmations & receipts',
                          value: _paymentAlerts,
                          onChanged: (v) => setState(() => _paymentAlerts = v),
                        ),
                        const Divider(height: 1),
                        _ToggleTile(
                          title: 'Promotional Messages',
                          subtitle: 'Offers and platform news',
                          value: _promotionalMessages,
                          onChanged: (v) =>
                              setState(() => _promotionalMessages = v),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Security
                    _SectionHeader(
                      title: 'Security',
                      icon: Icons.shield_outlined,
                    ),
                    const SizedBox(height: 12),
                    _SettingsCard(
                      children: [
                        _SettingsTile(
                          icon: Icons.lock_outline,
                          title: 'Change Password',
                          subtitle: 'Update your password',
                          onTap: () {},
                        ),
                        const Divider(height: 1),
                        _ToggleTile(
                          title: 'Two-Factor Authentication',
                          subtitle: 'Add extra security to your account',
                          value: _twoFactorAuth,
                          onChanged: (v) => setState(() => _twoFactorAuth = v),
                        ),
                        const Divider(height: 1),
                        _ToggleTile(
                          title: 'Biometric Login',
                          subtitle: 'Use fingerprint or face to login',
                          value: _biometricLogin,
                          onChanged: (v) => setState(() => _biometricLogin = v),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Preferences
                    _SectionHeader(title: 'Preferences', icon: Icons.tune),
                    const SizedBox(height: 12),
                    _SettingsCard(
                      children: [
                        ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 4,
                          ),
                          leading: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Theme.of(
                                context,
                              ).colorScheme.surfaceContainerHighest,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.language,
                              size: 20,
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                            ),
                          ),
                          title: const Text(
                            'Language',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          trailing: DropdownButton<String>(
                            value: _selectedLanguage,
                            underline: const SizedBox.shrink(),
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSurface,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                            items: ['English', 'Amharic'].map((lang) {
                              return DropdownMenuItem(
                                value: lang,
                                child: Text(lang),
                              );
                            }).toList(),
                            onChanged: (v) =>
                                setState(() => _selectedLanguage = v!),
                          ),
                        ),
                        const Divider(height: 1),
                        _ToggleTile(
                          title: 'Dark Mode',
                          subtitle: 'Switch to dark theme',
                          value: ref.watch(themeProvider) == ThemeMode.dark,
                          onChanged: (v) {
                            ref.read(themeProvider.notifier).toggleTheme();
                          },
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Legal
                    _SectionHeader(title: 'Legal', icon: Icons.gavel),
                    const SizedBox(height: 12),
                    _SettingsCard(
                      children: [
                        _SettingsTile(
                          icon: Icons.description_outlined,
                          title: 'Terms of Service',
                          subtitle: 'Read our terms',
                          onTap: () => Navigator.pushNamed(context, '/terms'),
                        ),
                        const Divider(height: 1),
                        _SettingsTile(
                          icon: Icons.privacy_tip_outlined,
                          title: 'Privacy Policy',
                          subtitle: 'How we handle your data',
                          onTap: () => Navigator.pushNamed(context, '/privacy'),
                        ),
                      ],
                    ),

                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionHeader({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.primaryNavy),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.onSurface,
          ),
        ),
      ],
    );
  }
}

class _SettingsCard extends StatelessWidget {
  final List<Widget> children;

  const _SettingsCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).colorScheme.shadow.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(children: children),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          icon,
          size: 20,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 14,
          color: Theme.of(context).colorScheme.onSurface,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          color: Theme.of(context).colorScheme.onSurfaceVariant,
          fontSize: 12,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: Theme.of(context).colorScheme.outlineVariant,
        size: 18,
      ),
      onTap: onTap,
    );
  }
}

class _ToggleTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 14,
          color: Theme.of(context).colorScheme.onSurface,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          color: Theme.of(context).colorScheme.onSurfaceVariant,
          fontSize: 12,
        ),
      ),
      trailing: Switch.adaptive(
        value: value,
        onChanged: onChanged,
        activeTrackColor: Theme.of(context).colorScheme.primary,
      ),
    );
  }
}
