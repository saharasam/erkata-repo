import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

class PreferencesScreen extends ConsumerWidget {
  const PreferencesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const ErkataScreenHeader(
              title: 'Preferences',
              subtitle: 'Customize your app experience',
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  _SectionHeader(title: 'App Appearance'),
                  const SizedBox(height: 12),
                  _PreferenceCard(
                    child: Column(
                      children: [
                        _ToggleTile(
                          title: 'Dark Mode',
                          subtitle: 'Switch to a dark color scheme',
                          value: themeMode == ThemeMode.dark,
                          onChanged: (v) {
                            ref.read(themeProvider.notifier).toggleTheme();
                          },
                          icon: Icons.dark_mode_outlined,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  _SectionHeader(title: 'Language'),
                  const SizedBox(height: 12),
                  _PreferenceCard(
                    child: Column(
                      children: [
                        _LanguageTile(
                          title: 'English',
                          isSelected: true, // Mocked for now
                          onTap: () {},
                        ),
                        const Divider(height: 1),
                        _LanguageTile(
                          title: 'Amharic (አማርኛ)',
                          isSelected: false,
                          onTap: () {},
                        ),
                        const Divider(height: 1),
                        _LanguageTile(
                          title: 'Oromiffa',
                          isSelected: false,
                          onTap: () {},
                        ),
                      ],
                    ),
                  ),
                ],
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
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.5,
        color: Colors.grey,
      ),
    );
  }
}

class _PreferenceCard extends StatelessWidget {
  final Widget child;
  const _PreferenceCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5),
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: child,
      ),
    );
  }
}

class _ToggleTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final IconData icon;

  const _ToggleTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: Theme.of(context).colorScheme.primary),
      ),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Text(subtitle),
      trailing: Switch.adaptive(value: value, onChanged: onChanged),
    );
  }
}

class _LanguageTile extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _LanguageTile({
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      trailing: isSelected
          ? Icon(Icons.check_circle, color: Theme.of(context).colorScheme.primary)
          : null,
    );
  }
}
