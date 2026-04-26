import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../../../shared/widgets/erkata_screen_header.dart';
import '../../auth/state/auth_provider.dart';
import 'package:intl/intl.dart';

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
                            style: TextStyle(color: Colors.grey[600], fontSize: 16),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Share your referral link from the Earnings page!',
                            style: TextStyle(color: Colors.grey[500], fontSize: 13),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
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
    );
  }
}

class _ReferralTile extends StatelessWidget {
  final dynamic info; 

  const _ReferralTile({required this.info});

  @override
  Widget build(BuildContext context) {
    final date = DateTime.tryParse(info.createdAt) ?? DateTime.now();
    final formattedDate = DateFormat('MMM dd, yyyy').format(date);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
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
              color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.5),
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.secondaryContainer,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              info.role.toUpperCase(),
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSecondaryContainer,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
