import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.offWhite,
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'Terms of Service',
              subtitle: 'Rules and guidelines',
              onActionTap: () => Navigator.of(context).pop(),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.pureWhite,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.charcoal.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Last Updated: February 2026',
                        style: TextStyle(
                          color: AppColors.mediumGrey,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 24),
                      _section(
                        '1. Acceptance of Terms',
                        'By accessing or using the Erkata platform, you agree to be bound by these Terms of Service. '
                            'If you do not agree, you may not use the platform.',
                      ),
                      _section(
                        '2. Platform Description',
                        'Erkata is a hierarchical mediation platform connecting Sellers/Customers (Requestors), Agents (Executors), '
                            'Operators (Mandatory Intermediaries), Admins (Management Layer), and the Super Admin (Owner). '
                            'The platform enforces a strict escalation chain — no decision bypasses hierarchy.',
                      ),
                      _section(
                        '3. User Roles & Responsibilities',
                        '• Customers/Sellers: Submit structured requirement forms to operators. Provide honest post-delivery feedback.\n'
                            '• Agents: Fulfill assigned requests within licensed zones. Operate under the tiered package system (Free, Peace, Love, Unity, Abundant Life).\n'
                            '• Operators: Act as neutral intermediaries. Cannot originate requests, fulfill services, edit feedback, or resolve disputes.',
                      ),
                      _section(
                        '4. Agent Tier System',
                        'Agents operate under a tiered subscription model:\n'
                            '• Free: 3 referral slots, 1 zone\n'
                            '• Peace: 7 referral slots, 2 zones\n'
                            '• Love: 16 referral slots, 3 zones\n'
                            '• Unity: 23 referral slots, 5 zones\n'
                            '• Abundant Life: 31 referral slots, unlimited zones\n\n'
                            'Referral commission applies to first-generation (direct) referrals only across all paid tiers.',
                      ),
                      _section(
                        '5. Geographic Zoning',
                        'Agent registration and operational rights are zoned by kifle ketema / woreda. '
                            'Agents may only accept and fulfill requests within their authorized zones. '
                            'Higher-tier agents progressively unlock larger territories.',
                      ),
                      _section(
                        '6. Feedback & Dispute Resolution',
                        'All feedback follows the immutable 5-step escalation chain:\n'
                            '1. Customer submits feedback to Operator\n'
                            '2. Agent submits feedback to Operator\n'
                            '3. Operator bundles both sides\n'
                            '4. Admin reviews and proposes resolution\n'
                            '5. Super Admin approves or rejects\n\n'
                            'No resolution is recorded without Super Admin sign-off. No step may be bypassed.',
                      ),
                      _section(
                        '7. Payments & Commissions',
                        'The platform facilitates secure payments between parties. Commission structures are determined by agent tier. '
                            'All payment processing is subject to applicable fees and terms.',
                      ),
                      _section(
                        '8. Limitation of Liability',
                        'Erkata acts as a mediation platform and is not directly responsible for the quality of services provided by agents. '
                            'Our role is to enforce structure, transparency, and fair dispute resolution through the hierarchy.',
                      ),
                      _section(
                        '9. Contact',
                        'For questions about these Terms, contact us at support@erkata.com.',
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
            style: const TextStyle(
              color: AppColors.darkGrey,
              fontSize: 14,
              height: 1.7,
            ),
          ),
        ],
      ),
    );
  }
}
