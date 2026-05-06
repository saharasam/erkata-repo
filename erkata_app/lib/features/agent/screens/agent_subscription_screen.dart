import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/erkata_screen_header.dart';
import '../data/repositories/agent_repository.dart';
import '../state/packages_provider.dart';
import '../state/active_upgrade_provider.dart';
import '../../auth/state/auth_provider.dart';

class AgentSubscriptionScreen extends ConsumerWidget {
  const AgentSubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final packagesAsync = ref.watch(availablePackagesProvider);
    final activeUpgradeAsync = ref.watch(activeUpgradeProvider);
    final user = ref.watch(authProvider).user;
    final currentTier = user?.tier ?? 'FREE';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ErkataScreenHeader(
              title: 'Subscription',
              subtitle: 'Manage your membership plan',
              onActionTap: () => context.pop(),
            ),
            activeUpgradeAsync.when(
              data: (upgrade) {
                if (upgrade != null) {
                  return Container(
                    width: double.infinity,
                    margin: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.brandGold.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.brandGold.withValues(alpha: 0.3),
                      ),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.info_outline, color: AppColors.brandGold),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Upgrade Pending Administrator Approval',
                            style: TextStyle(
                              color: AppColors.brandGold,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
              loading: () => const SizedBox.shrink(),
              error: (_, _) => const SizedBox.shrink(),
            ),
            Expanded(
              child: packagesAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(
                    color: AppColors.brandPrimary,
                  ),
                ),
                error: (err, stack) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 48,
                        color: AppColors.errorRed,
                      ),
                      const SizedBox(height: 16),
                      Text('Error loading plans: $err'),
                      TextButton(
                        onPressed: () => ref.refresh(availablePackagesProvider),
                        child: const Text('Try Again'),
                      ),
                    ],
                  ),
                ),
                data: (packages) {
                  final currentPkg = packages.firstWhere(
                    (p) => p['name'] == currentTier,
                    orElse: () => null,
                  );

                  final hasPending = activeUpgradeAsync.value != null;

                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      // Current Plan Hero Section
                      _CurrentPlanHero(
                        tier: currentTier,
                        displayName: currentPkg?['displayName'] ?? currentTier,
                        referralSlots: currentPkg?['referralSlots'] ?? 0,
                        usedSlots: user?.referrals?.length ?? 0,
                      ),

                      const SizedBox(height: 40),

                      Row(
                        children: [
                          Container(
                            width: 4,
                            height: 20,
                            decoration: BoxDecoration(
                              color: AppColors.brandPrimary,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            'UPGRADE YOUR REACH',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.brandPrimary,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Filter out current tier and show upgrades
                      ...packages
                          .where((p) => p['name'] != currentTier)
                          .map(
                            (pkg) => _PackageUpgradeCard(
                              pkg: pkg,
                              isLocked: hasPending,
                              onUpgrade: () =>
                                  _handleUpgrade(context, ref, pkg),
                            ),
                          ),
                      const SizedBox(height: 40),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleUpgrade(BuildContext context, WidgetRef ref, dynamic pkg) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => _UpgradeFlowDialog(pkg: pkg),
    );
  }
}

class _UpgradeFlowDialog extends StatefulWidget {
  final dynamic pkg;
  const _UpgradeFlowDialog({required this.pkg});

  @override
  State<_UpgradeFlowDialog> createState() => _UpgradeFlowDialogState();
}

class _UpgradeFlowDialogState extends State<_UpgradeFlowDialog> {
  int _step = 1; // 1: Bank Details, 2: Proof Upload
  bool _isLoading = false;
  bool _isCreatingRequest = false;
  File? _selectedImage;
  String? _errorMessage;

  /// Stored after request creation. Reused on proof retry to avoid orphaning.
  String? _pendingRequestId;

  @override
  void initState() {
    super.initState();
    _fetchBankDetails();
  }

  Future<void> _fetchBankDetails() async {
    setState(() => _isLoading = true);
    try {
      // Data fetched via FutureBuilder in UI
    } catch (e) {
      // Handle error
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // We need to access providers here. We can use Consumer
    return Consumer(
      builder: (context, ref, child) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (_step == 1) _buildBankDetailsStep(ref),
                if (_step == 2) _buildProofUploadStep(ref),
                if (_errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _errorMessage!,
                    style: const TextStyle(
                      color: AppColors.errorRed,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBankDetailsStep(WidgetRef ref) {
    return Column(
      children: [
        const Icon(
          Icons.account_balance_wallet_outlined,
          size: 48,
          color: AppColors.brandPrimary,
        ),
        const SizedBox(height: 16),
        Text(
          'Step 1: Payment',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: AppColors.brandPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Please transfer ${widget.pkg['price']} ETB to the following account:',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.slate, fontSize: 14),
        ),
        const SizedBox(height: 24),
        FutureBuilder(
          future: ref.read(agentRepositoryProvider).getBankDetails(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const CircularProgressIndicator();
            }
            if (snapshot.hasError) {
              return Text('Error: ${snapshot.error}');
            }
            final details = snapshot.data as Map<String, dynamic>;
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderColor),
              ),
              child: Column(
                children: [
                  _buildDetailRow('Bank', details['bankName']),
                  const Divider(height: 24),
                  _buildDetailRow('Number', details['accountNumber']),
                  const Divider(height: 24),
                  _buildDetailRow('Name', details['accountHolder']),
                ],
              ),
            );
          },
        ),
        const SizedBox(height: 32),
        Row(
          children: [
            Expanded(
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _isCreatingRequest
                    ? null
                    : () => _createRequestAndProceed(ref),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brandPrimary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _isCreatingRequest
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(' sent '),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppColors.slate, fontSize: 12),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
        ),
      ],
    );
  }

  Widget _buildProofUploadStep(WidgetRef ref) {
    return Column(
      children: [
        const Icon(
          Icons.cloud_upload_outlined,
          size: 48,
          color: AppColors.brandPrimary,
        ),
        const SizedBox(height: 16),
        const Text(
          'Step 2: Upload Proof',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: AppColors.brandPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Upload a screenshot of your transaction receipt.',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.slate, fontSize: 14),
        ),
        const SizedBox(height: 24),
        GestureDetector(
          onTap: _pickImage,
          child: Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.borderColor,
                style: BorderStyle.solid,
              ),
            ),
            child: _selectedImage == null
                ? const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.add_a_photo_outlined, color: AppColors.slate),
                      SizedBox(height: 8),
                      Text(
                        'Select Receipt Photo',
                        style: TextStyle(color: AppColors.slate, fontSize: 13),
                      ),
                    ],
                  )
                : Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.file(
                          _selectedImage!,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        right: 8,
                        top: 8,
                        child: CircleAvatar(
                          backgroundColor: Colors.black54,
                          child: IconButton(
                            icon: const Icon(Icons.close, color: Colors.white),
                            onPressed: () =>
                                setState(() => _selectedImage = null),
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
        if (_selectedImage != null) ...[
          const SizedBox(height: 12),
          Text(
            p.basename(_selectedImage!.path),
            style: const TextStyle(fontSize: 12, color: AppColors.slate),
          ),
        ],
        const SizedBox(height: 32),
        Row(
          children: [
            Expanded(
              child: TextButton(
                onPressed: () => setState(() => _step = 1),
                child: const Text('Back'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: (_selectedImage == null || _isLoading)
                    ? null
                    : () => _submitProof(ref),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _selectedImage == null
                      ? AppColors.slate
                      : AppColors.successGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        _selectedImage == null
                            ? 'Select a photo first'
                            : 'Confirm Submission',
                      ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 70,
    );
    if (image != null) {
      setState(() {
        _selectedImage = File(image.path);
        _errorMessage = null; // clear any previous error on new selection
      });
    }
  }

  /// Step 1 → 2: Creates the upgrade request on the backend and advances the step.
  /// The returned request ID is stored so that proof submission can retry
  /// without creating a new (orphaned) request.
  Future<void> _createRequestAndProceed(WidgetRef ref) async {
    setState(() {
      _isCreatingRequest = true;
      _errorMessage = null;
    });
    try {
      final repo = ref.read(agentRepositoryProvider);
      final request = await repo.requestUpgrade(widget.pkg['name']);
      _pendingRequestId = request['id'] as String;
      if (mounted) setState(() => _step = 2);
    } catch (e) {
      setState(() {
        _errorMessage =
            'Could not initiate upgrade request. Please check your connection and try again.';
      });
    } finally {
      if (mounted) setState(() => _isCreatingRequest = false);
    }
  }

  /// Step 2: Submits the proof photo for the already-created request.
  /// Always uses [_pendingRequestId] — safe to retry without orphaning.
  Future<void> _submitProof(WidgetRef ref) async {
    // Hard guard: image is required
    if (_selectedImage == null) {
      setState(
        () => _errorMessage =
            'You must select a payment receipt photo before submitting.',
      );
      return;
    }
    // Session guard: request must exist
    if (_pendingRequestId == null) {
      setState(
        () => _errorMessage =
            'Session error — request ID missing. Please close and start again.',
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repo = ref.read(agentRepositoryProvider);
      // Reuses the stored ID — retrying this step never creates a new orphan
      await repo.submitProof(_pendingRequestId!, _selectedImage!);
      ref.invalidate(activeUpgradeProvider);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Upgrade request submitted! Awaiting operator review.',
            ),
            backgroundColor: AppColors.successGreen,
            duration: Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      // Proof failed — request is still alive; user can tap retry
      setState(() {
        _errorMessage =
            'Proof upload failed. Your request is still active — please tap Confirm again to retry.';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _CurrentPlanHero extends StatelessWidget {
  final String tier;
  final String displayName;
  final int referralSlots;
  final int usedSlots;

  const _CurrentPlanHero({
    required this.tier,
    required this.displayName,
    required this.referralSlots,
    required this.usedSlots,
  });

  @override
  Widget build(BuildContext context) {
    final progress = referralSlots > 0
        ? (usedSlots / referralSlots).clamp(0.0, 1.0)
        : 0.0;
    final gradient = _getGradientForTier(tier);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: _getTierColor(tier).withValues(alpha: 0.3),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.3),
                  ),
                ),
                child: const Text(
                  'ACTIVE PLAN',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const Icon(Icons.verified_user, color: Colors.white, size: 24),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            displayName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your current agent standing in the network.',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Referral Network Growth',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              Text(
                '$usedSlots / ${referralSlots > 0 ? referralSlots : "∞"}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Stack(
            children: [
              Container(
                height: 10,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(5),
                ),
              ),
              FractionallySizedBox(
                widthFactor: progress,
                child: Container(
                  height: 10,
                  decoration: BoxDecoration(
                    color: AppColors.brandGold,
                    borderRadius: BorderRadius.circular(5),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.brandGold.withValues(alpha: 0.5),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  LinearGradient _getGradientForTier(String tier) {
    switch (tier.toUpperCase()) {
      case 'UNITY':
      case 'ABUNDANT_LIFE':
        return const LinearGradient(
          colors: [AppColors.brandPrimary, AppColors.brandPrimaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      default:
        return AppColors.primaryGradient;
    }
  }

  Color _getTierColor(String tier) {
    switch (tier.toUpperCase()) {
      case 'UNITY':
        return AppColors.brandGold;
      case 'ABUNDANT_LIFE':
        return AppColors.brandPrimary;
      default:
        return AppColors.brandPrimary;
    }
  }
}

class _PackageUpgradeCard extends StatelessWidget {
  final dynamic pkg;
  final VoidCallback onUpgrade;
  final bool isLocked;

  const _PackageUpgradeCard({
    required this.pkg,
    required this.onUpgrade,
    this.isLocked = false,
  });

  @override
  Widget build(BuildContext context) {
    final String tierName = pkg['name'] ?? '';
    final bool isPremium = tierName == 'UNITY' || tierName == 'ABUNDANT_LIFE';

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
        border: isPremium
            ? Border.all(
                color: AppColors.brandGold.withValues(alpha: 0.3),
                width: 2,
              )
            : Border.all(color: AppColors.borderColor),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          children: [
            if (isPremium)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 6),
                decoration: const BoxDecoration(
                  gradient: AppColors.goldGradient,
                ),
                child: const Center(
                  child: Text(
                    'RECOMMENDED FOR GROWTH',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        pkg['displayName'],
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: AppColors.brandPrimary,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.brandPrimaryLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${pkg['price']} ETB',
                          style: const TextStyle(
                            color: AppColors.brandPrimary,
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _TierFeatureItem(
                    icon: Icons.people_outline,
                    label: '${pkg['referralSlots']} Referral Slots',
                    subtitle: 'Expand your earning potential',
                  ),
                  const SizedBox(height: 16),
                  _TierFeatureItem(
                    icon: Icons.map_outlined,
                    label: '${pkg['zoneLimit']} Geographic Zones',
                    subtitle: 'Wider service area coverage',
                  ),
                  const SizedBox(height: 16),
                  _TierFeatureItem(
                    icon: Icons.bolt,
                    label: _getPriorityLabel(pkg['name']),
                    subtitle: 'Lead assignment priority',
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: isLocked ? null : onUpgrade,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isPremium
                            ? AppColors.brandGold
                            : AppColors.brandPrimary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Text(
                        isLocked ? 'Upgrade Pending' : 'Select Plan',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
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

  String _getPriorityLabel(String? tier) {
    switch (tier?.toUpperCase()) {
      case 'PEACE':
        return 'Medium Priority';
      case 'LOVE':
        return 'High Priority';
      case 'UNITY':
        return 'Very High Priority';
      case 'ABUNDANT_LIFE':
        return 'Maximum Priority';
      default:
        return 'Low Priority';
    }
  }
}

class _TierFeatureItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;

  const _TierFeatureItem({
    required this.icon,
    required this.label,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.brandPrimary, size: 20),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14,
                color: AppColors.brandPrimary,
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 12, color: AppColors.slate),
            ),
          ],
        ),
      ],
    );
  }
}
