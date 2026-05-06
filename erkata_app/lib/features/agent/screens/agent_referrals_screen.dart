import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/erkata_screen_header.dart';
import '../../auth/state/auth_provider.dart';
import '../../auth/data/models/user_profile.dart';

class AgentReferralsScreen extends ConsumerWidget {
  const AgentReferralsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final referrals = user?.referrals ?? [];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'My Referrals',
              subtitle: 'Agents you have referred',
              onActionTap: () => Navigator.of(context).pop(),
            ),
            Expanded(
              child: referrals.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.group_outlined, size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          Text(
                            'No referrals yet',
                            style: TextStyle(color: Colors.grey[600], fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          if (user?.referralCode != null) ...[
                            Text(
                              'Share your code to grow your network',
                              style: TextStyle(color: Colors.grey[500], fontSize: 13),
                            ),
                            const SizedBox(height: 24),
                            _QuickCodeCard(code: user!.referralCode!),
                          ] else
                            Text(
                              'Generate your referral code from the Earnings page!',
                              style: TextStyle(color: Colors.grey[500], fontSize: 13),
                            ),
                        ],
                      ),
                    )
                  : Column(
                      children: [
                        if (user?.referralCode != null)
                          Padding(
                            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                            child: _QuickCodeCard(code: user!.referralCode!),
                          ),
                        Expanded(
                          child: ListView.separated(
                            padding: const EdgeInsets.all(20),
                            itemCount: referrals.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final refInfo = referrals[index];
                              return _ReferralTile(info: refInfo);
                            },
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

class _QuickCodeCard extends HookWidget {
  final String code;
  const _QuickCodeCard({required this.code});

  @override
  Widget build(BuildContext context) {
    final isCopied = useState(false);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1)),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'YOUR CODE',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.6),
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                code,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          const Spacer(),
          IconButton.filledTonal(
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: code));
              isCopied.value = true;
              Future.delayed(const Duration(seconds: 2), () {
                isCopied.value = false;
              });
            },
            icon: Icon(isCopied.value ? Icons.check : Icons.copy, size: 20),
          ),
        ],
      ),
    );
  }
}

class _ReferralTile extends StatelessWidget {
  final ReferralInfo info;

  const _ReferralTile({required this.info});

  @override
  Widget build(BuildContext context) {
    final date = DateTime.tryParse(info.createdAt) ?? DateTime.now();
    final formattedDate = DateFormat('MMM dd, yyyy').format(date);

    final tier = info.tier ?? 'FREE';
    final packageDisplayName =
        info.package?['displayName'] as String? ?? tier.replaceAll('_', ' ');
    final isFree = tier == 'FREE';

    return InkWell(
      onTap:
          () => context.push(
            '/agent/referrals/${info.id}/deep-dive',
            extra: {'fullName': info.fullName},
          ),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).shadowColor.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(
                  context,
                ).colorScheme.primaryContainer.withValues(alpha: 0.5),
                shape: BoxShape.circle,
              ),
              child: Text(
                info.fullName.isNotEmpty ? info.fullName[0].toUpperCase() : '?',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    info.fullName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Joined $formattedDate',
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color:
                        isFree
                            ? Theme.of(context).colorScheme.secondaryContainer
                            : Theme.of(
                              context,
                            ).colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    packageDisplayName.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color:
                          isFree
                              ? Theme.of(
                                context,
                              ).colorScheme.onSecondaryContainer
                              : Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  info.role.toUpperCase(),
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: Theme.of(
                      context,
                    ).colorScheme.onSurfaceVariant.withValues(alpha: 0.6),
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

