import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/theme/colors.dart';
import '../../../../shared/widgets/erkata_screen_header.dart';
import '../data/repositories/agent_repository.dart';
import '../state/finance_provider.dart';

class AgentCommissionScreen extends HookConsumerWidget {
  const AgentCommissionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final financeAsync = ref.watch(financeSummaryProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'Earnings',
              subtitle: 'Manage your revenue and referrals',
              onActionTap: () => context.pop(),
            ),
            Expanded(
              child: financeAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppColors.errorRed),
                      const SizedBox(height: 16),
                      Text('Error: $err'),
                      TextButton(
                        onPressed: () => ref.refresh(financeSummaryProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
                data: (summary) => RefreshIndicator(
                  onRefresh: () => ref.refresh(financeSummaryProvider.future),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 16),
                        // Premium Integrated Hero Card
                        _BalanceHero(
                          balance: summary.aglpBalance,
                          pending: summary.aglpPending,
                          withdrawn: summary.aglpWithdrawn,
                          totalEarned: summary.aglpBalance + summary.aglpWithdrawn,
                          onWithdraw: () => _showWithdrawalDialog(context, ref, summary.aglpBalance),
                        ),
                        const SizedBox(height: 24),

                        // Referral Section
                        const _ReferralCard(),
                        const SizedBox(height: 32),

                        // Transaction History Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'TRANSACTION HISTORY',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: AppColors.slate,
                                letterSpacing: 1.5,
                              ),
                            ),
                            if (summary.history.isNotEmpty)
                              Text(
                                '${summary.history.length} items',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        if (summary.history.isEmpty)
                          _EmptyHistory()
                        else
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: summary.history.length,
                            separatorBuilder: (_, _) => const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final tx = summary.history[index];
                              return _TransactionCard(tx: tx);
                            },
                          ),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showWithdrawalDialog(BuildContext context, WidgetRef ref, double max) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Withdraw AGLP'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Available: ${max.toStringAsFixed(0)} AGLP',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                labelText: 'Amount',
                hintText: '0.00',
                suffixText: 'AGLP',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              final amount = double.tryParse(controller.text);
              if (amount == null || amount <= 0 || amount > max) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter a valid amount')),
                );
                return;
              }
              
              Navigator.pop(context);
              try {
                final repo = ref.read(agentRepositoryProvider);
                await repo.requestWithdrawal(amount);
                ref.invalidate(financeSummaryProvider);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Withdrawal request submitted successfully!'),
                      backgroundColor: AppColors.successGreen,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.errorRed),
                  );
                }
              }
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }
}

class _BalanceHero extends StatelessWidget {
  final double balance;
  final double pending;
  final double withdrawn;
  final double totalEarned;
  final VoidCallback onWithdraw;

  const _BalanceHero({
    required this.balance,
    required this.pending,
    required this.withdrawn,
    required this.totalEarned,
    required this.onWithdraw,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: AppColors.brandPrimary.withValues(alpha: 0.3),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // Background Decorative Icon
          Positioned(
            right: -20,
            top: -20,
            child: Icon(
              Icons.account_balance_wallet,
              size: 160,
              color: Colors.white.withValues(alpha: 0.05),
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'AVAILABLE BALANCE',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.6),
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.5,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.trending_up, color: AppColors.successGreen.withValues(alpha: 0.8), size: 14),
                          const SizedBox(width: 4),
                          const Text(
                            'LIVE',
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      balance.toStringAsFixed(0),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 48,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'AGLP',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                
                // Integrated Sub-stats Row
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 1),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _CardSubStat(
                          label: 'PENDING',
                          value: '${pending.toStringAsFixed(0)} AGLP',
                          color: AppColors.warningOrange,
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 30,
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                      Expanded(
                        child: _CardSubStat(
                          label: 'WITHDRAWN',
                          value: '${withdrawn.toStringAsFixed(0)} AGLP',
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 8),
                
                // Action Row
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TOTAL REVENUE',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.4),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            '${totalEarned.toStringAsFixed(0)} AGLP',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: balance > 0 ? onWithdraw : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.brandGold,
                        foregroundColor: AppColors.brandPrimary,
                        elevation: 4,
                        shadowColor: AppColors.brandGold.withValues(alpha: 0.4),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      ),
                      child: const Text(
                        'Withdraw',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CardSubStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _CardSubStat({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.5),
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

class _TransactionCard extends StatelessWidget {
  final Map<String, dynamic> tx;

  const _TransactionCard({required this.tx});

  @override
  Widget build(BuildContext context) {
    final action = tx['action']?.toString() ?? '';
    final isCredit = !(action.contains('SPEND') || action.contains('PAYOUT'));
    final amount = tx['metadata']?['amountAglp']?.toString() ?? '0';
    final reason = tx['metadata']?['reason'] ?? action;
    final date = tx['createdAt']?.toString() ?? 'Recently';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isCredit ? AppColors.successGreen.withValues(alpha: 0.1) : AppColors.peachBg,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isCredit ? Icons.arrow_upward : Icons.arrow_downward,
              color: isCredit ? AppColors.successGreen : AppColors.secondaryBrown,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  reason,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.charcoal,
                    fontSize: 14,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  date,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : '-'} $amount AGLP',
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: isCredit ? AppColors.successGreen : AppColors.charcoal,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReferralCard extends HookConsumerWidget {
  const _ReferralCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoading = useState(false);
    final isCopied = useState(false);
    final referralData = useState<ReferralData?>(null);
    final error = useState<String?>(null);

    final handleGenerate = useCallback(() async {
      isLoading.value = true;
      error.value = null;
      try {
        final repo = ref.read(agentRepositoryProvider);
        final data = await repo.generateReferralCode();
        referralData.value = data;
      } catch (e) {
        error.value = "Failed to load referral link";
      } finally {
        isLoading.value = false;
      }
    }, []);

    final handleCopy = useCallback(() async {
      if (referralData.value != null) {
        await Clipboard.setData(ClipboardData(text: referralData.value!.link));
        isCopied.value = true;
        Future.delayed(const Duration(seconds: 2), () {
          if (context.mounted) isCopied.value = false;
        });
      }
    }, [referralData.value]);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.brandPrimary,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.people_outline, color: AppColors.brandGold, size: 24),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Refer & Earn',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Invite agents and get commissions',
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (referralData.value == null)
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: isLoading.value ? null : handleGenerate,
                style: FilledButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.brandPrimary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading.value
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.brandPrimary),
                      )
                    : const Text('Generate Referral Link', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            )
          else
            Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          referralData.value!.link,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                            fontFamily: 'monospace',
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 12),
                      GestureDetector(
                        onTap: handleCopy,
                        child: Icon(
                          isCopied.value ? Icons.check_circle : Icons.copy,
                          color: isCopied.value ? AppColors.successGreen : AppColors.brandGold,
                          size: 20,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isCopied.value)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text(
                      'Link copied to clipboard!',
                      style: TextStyle(color: AppColors.successGreen, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

class _EmptyHistory extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 48),
        child: Column(
          children: [
            Icon(Icons.history_toggle_off, size: 64, color: AppColors.softGrey),
            SizedBox(height: 16),
            Text(
              'No transactions found',
              style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600),
            ),
            Text(
              'Your earnings history will appear here',
              style: TextStyle(color: AppColors.mediumGrey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
