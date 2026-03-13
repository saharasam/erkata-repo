import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

class AgentCommunicationScreen extends StatelessWidget {
  const AgentCommunicationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'Contact Customer',
              subtitle: 'Communication options',
              onActionTap: () => context.pop(),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(
                  left: 20,
                  right: 20,
                  top: 20,
                  bottom: 120,
                ),
                child: Column(
                  children: [
                    // Customer Profile Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: Theme.of(context).colorScheme.outlineVariant,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Theme.of(
                              context,
                            ).shadowColor.withValues(alpha: 0.05),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: Theme.of(
                                context,
                              ).colorScheme.surfaceContainerHighest,
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Text('👤', style: TextStyle(fontSize: 32)),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Kebede Tesfaye',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Request ID: #REQ-2023-001',
                            style: TextStyle(
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 24),

                          const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _ContactButton(
                                icon: Icons.phone,
                                label: 'Call',
                                color: Colors.green,
                              ),
                              SizedBox(width: 16),
                              _ContactButton(
                                icon: Icons.message,
                                label: 'SMS',
                                color: AppColors.brandPrimary,
                              ),
                              SizedBox(width: 16),
                              _ContactButton(
                                icon: Icons.chat_bubble_outline,
                                label: 'WhatsApp',
                                color: Colors.green,
                              ),
                              SizedBox(width: 16),
                              _ContactButton(
                                icon: Icons.mail_outline,
                                label: 'Email',
                                color: Colors.grey,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Request Context
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'REQUEST CONTEXT',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Theme.of(context).colorScheme.outlineVariant,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Theme.of(
                              context,
                            ).shadowColor.withValues(alpha: 0.05),
                            blurRadius: 2,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          _ContextRow(
                            label: 'Looking for a custom L-shape sofa.',
                            sub: 'Requirements',
                          ),
                          const SizedBox(height: 16),
                          _ContextRow(
                            label: 'Budget: 25,000 - 35,000 ETB',
                            sub: 'Budget Range',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Main CTA
                    PrimaryButton(
                      text: 'Call Now',
                      icon: Icons.phone,
                      onPressed: () {},
                    ),
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

class _ContactButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _ContactButton({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _ContextRow extends StatelessWidget {
  final String label;
  final String sub;

  // ignore: unused_element
  const _ContextRow({required this.label, required this.sub});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 6.0),
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
              shape: BoxShape.circle,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              sub,
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
