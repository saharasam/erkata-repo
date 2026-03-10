import 'package:flutter/material.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'Privacy Policy',
              subtitle: 'How we handle your data',
              onActionTap: () => Navigator.of(context).pop(),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Theme.of(
                          context,
                        ).shadowColor.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Last Updated: February 2026',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 24),
                      _section(
                        context,
                        'Information We Collect',
                        'We collect personal information that you provide when registering, submitting requests, or using our services. '
                            'This includes your name, email address, phone number, location data (kifle ketema / woreda), and transaction history.',
                      ),
                      _section(
                        context,
                        'How We Use Your Information',
                        'Your information is used to:\n'
                            '• Match your requests with qualified local agents\n'
                            '• Facilitate communication through neutral operators\n'
                            '• Process payments and commission calculations\n'
                            '• Improve our platform and services\n'
                            '• Comply with legal obligations',
                      ),
                      _section(
                        context,
                        'Data Protection',
                        'We implement industry-standard security measures to protect your data. '
                            'Customer names are masked in agent-facing views. All feedback is bundled anonymously through the operator layer. '
                            'No personal information is shared without your consent.',
                      ),
                      _section(
                        context,
                        'Geographic Data',
                        'Location information is collected to enforce zone-based service matching. '
                            'Agents can only operate within their licensed zones (kifle ketema / woreda). '
                            'This ensures localized, accountable service delivery.',
                      ),
                      _section(
                        context,
                        'Feedback & Escalation',
                        'Feedback submitted by customers and agents is processed through the immutable 5-step escalation chain. '
                            'Operators cannot edit feedback. Admins propose resolutions but cannot finalize them. '
                            'Only the Super Admin has final authority over dispute resolutions.',
                      ),
                      _section(
                        context,
                        'Your Rights',
                        'You have the right to:\n'
                            '• Access your personal data\n'
                            '• Request correction of inaccurate information\n'
                            '• Request deletion of your account\n'
                            '• Opt out of promotional communications',
                      ),
                      _section(
                        context,
                        'Contact Us',
                        'If you have questions about this Privacy Policy, please contact us at support@erkata.com.',
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _section(BuildContext context, String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontSize: 14,
              height: 1.7,
            ),
          ),
        ],
      ),
    );
  }
}
