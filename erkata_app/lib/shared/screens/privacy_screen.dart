import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        title: const Text(
          'Privacy Policy',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.primaryNavy,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        iconTheme: const IconThemeData(color: AppColors.primaryNavy),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
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
                  color: Colors.grey[500],
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 24),
              _section(
                'Information We Collect',
                'We collect personal information that you provide when registering, submitting requests, or using our services. '
                    'This includes your name, email address, phone number, location data (kifle ketema / woreda), and transaction history.',
              ),
              _section(
                'How We Use Your Information',
                'Your information is used to:\n'
                    '• Match your requests with qualified local agents\n'
                    '• Facilitate communication through neutral operators\n'
                    '• Process payments and commission calculations\n'
                    '• Improve our platform and services\n'
                    '• Comply with legal obligations',
              ),
              _section(
                'Data Protection',
                'We implement industry-standard security measures to protect your data. '
                    'Customer names are masked in agent-facing views. All feedback is bundled anonymously through the operator layer. '
                    'No personal information is shared without your consent.',
              ),
              _section(
                'Geographic Data',
                'Location information is collected to enforce zone-based service matching. '
                    'Agents can only operate within their licensed zones (kifle ketema / woreda). '
                    'This ensures localized, accountable service delivery.',
              ),
              _section(
                'Feedback & Escalation',
                'Feedback submitted by customers and agents is processed through the immutable 5-step escalation chain. '
                    'Operators cannot edit feedback. Admins propose resolutions but cannot finalize them. '
                    'Only the Super Admin has final authority over dispute resolutions.',
              ),
              _section(
                'Your Rights',
                'You have the right to:\n'
                    '• Access your personal data\n'
                    '• Request correction of inaccurate information\n'
                    '• Request deletion of your account\n'
                    '• Opt out of promotional communications',
              ),
              _section(
                'Contact Us',
                'If you have questions about this Privacy Policy, please contact us at support@erkata.com.',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _section(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
              height: 1.7,
            ),
          ),
        ],
      ),
    );
  }
}
