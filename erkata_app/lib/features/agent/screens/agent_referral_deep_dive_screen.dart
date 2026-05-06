import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:intl/intl.dart';
import '../../../shared/widgets/erkata_screen_header.dart';
import '../data/repositories/agent_repository.dart';
import '../../../core/theme/colors.dart';

class AgentReferralDeepDiveScreen extends HookConsumerWidget {
  final String userId;
  final String fullName;

  const AgentReferralDeepDiveScreen({
    super.key,
    required this.userId,
    required this.fullName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoading = useState(true);
    final profile = useState<Map<String, dynamic>?>(null);
    final error = useState<String?>(null);

    useEffect(() {
      Future<void> loadData() async {
        try {
          isLoading.value = true;
          final repo = ref.read(agentRepositoryProvider);
          final data = await repo.getAgentProfile(userId);
          profile.value = data;
        } catch (e) {
          error.value = e.toString();
        } finally {
          isLoading.value = false;
        }
      }

      loadData();
      return null;
    }, [userId]);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'Agent Deep Dive',
              subtitle: fullName,
              onActionTap: () => Navigator.of(context).pop(),
            ),
            Expanded(
              child: isLoading.value
                  ? const Center(child: CircularProgressIndicator())
                  : error.value != null
                  ? Center(child: Text('Error: ${error.value}'))
                  : _DeepDiveContent(profile: profile.value!),
            ),
          ],
        ),
      ),
    );
  }
}

class _DeepDiveContent extends StatelessWidget {
  final Map<String, dynamic> profile;

  const _DeepDiveContent({required this.profile});

  @override
  Widget build(BuildContext context) {
    final stats = profile['performanceStats'] as Map<String, dynamic>? ?? {};
    final tier = profile['tier']?.toString() ?? 'FREE';
    final packageDisplayName =
        (profile['package'] as Map<String, dynamic>?)?['displayName']
            ?.toString() ??
        tier.replaceAll('_', ' ');
    final createdAt =
        DateTime.tryParse(profile['createdAt']?.toString() ?? '') ??
        DateTime.now();
    final joinedDate = DateFormat('MMMM dd, yyyy').format(createdAt);

    // Calculate integrity score (similar to web)
    final missed = (stats['missedAssignments'] as num? ?? 0).toDouble();
    final warnings = (stats['warningCount'] as num? ?? 0).toDouble();
    final integrityScore = (10 - (warnings * 1.5 + missed * 1.0)).clamp(
      0.0,
      10.0,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Section
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Theme.of(context).colorScheme.outlineVariant,
              ),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context).shadowColor.withValues(alpha: 0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Center(
                    child: Text(
                      profile['fullName']?.toString().isNotEmpty == true
                          ? profile['fullName']![0].toUpperCase()
                          : '?',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        profile['fullName'] ?? 'Unknown Agent',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: tier == 'FREE'
                                  ? Theme.of(
                                      context,
                                    ).colorScheme.secondaryContainer
                                  : Theme.of(context).colorScheme.primary
                                        .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              packageDisplayName.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: tier == 'FREE'
                                    ? Theme.of(
                                        context,
                                      ).colorScheme.onSecondaryContainer
                                    : Theme.of(context).colorScheme.primary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            profile['isActive'] == true
                                ? '● Active'
                                : '○ Suspended',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: profile['isActive'] == true
                                  ? Colors.green
                                  : Colors.red,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Stats Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.5,
            children: [
                _StatCard(
                label: 'SUCCESS RATE',
                value:
                    stats['acceptedCount'] != null && stats['acceptedCount'] > 0
                    ? '${((stats['completedCount'] ?? 0) / stats['acceptedCount'] * 100).toStringAsFixed(1)}%'
                    : '0.0%',
                icon: Icons.trending_up,
                color: AppColors.successGreen,
              ),
              _StatCard(
                label: 'INTEGRITY SCORE',
                value: integrityScore.toStringAsFixed(1),
                icon: Icons.shield_outlined,
                color: Colors.amber,
              ),
              _StatCard(
                label: 'COMPLETED',
                value: (stats['completedCount'] ?? 0).toString(),
                icon: Icons.check_circle_outline,
                color: Colors.indigo,
              ),
              _StatCard(
                label: 'JOINED',
                value: DateFormat('MMM yyyy').format(createdAt),
                icon: Icons.calendar_today_outlined,
                color: AppColors.slate,
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Integrity Radar (Bars)
          Text(
            'INTEGRITY RADAR',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Theme.of(context).colorScheme.outlineVariant,
              ),
            ),
            child: Column(
              children: [
                _RadarBar(
                  label: 'Fulfillment Speed',
                  value:
                      stats['acceptedCount'] != null &&
                          stats['acceptedCount'] > 0
                      ? (stats['completedCount'] ?? 0) / stats['acceptedCount']
                      : 0.0,
                  color: Colors.indigo,
                ),
                const SizedBox(height: 20),
                _RadarBar(
                  label: 'Interaction Quality',
                  value: (stats['avgRating'] as num? ?? 0.0).toDouble() / 5.0,
                  color: Colors.amber,
                ),
                const SizedBox(height: 20),
                _RadarBar(
                  label: 'Compliance Health',
                  value: (1.0 - (warnings * 0.33)).clamp(0.0, 1.0),
                  color: Colors.amber,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Geographic Authority
          Text(
            'GEOGRAPHIC AUTHORITY',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Theme.of(context).colorScheme.outlineVariant,
              ),
            ),
            child: Column(
              children: [
                if ((profile['agentZones'] as List?)?.isNotEmpty == true)
                  ...(profile['agentZones'] as List).map((zone) {
                    final zoneName = zone['zone']?['name'] ?? 'Unknown Zone';
                    final woreda = zone['woreda'] ?? 'Unknown Woreda';
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Icon(
                            Icons.public,
                            size: 16,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  woreda.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                Text(
                                  zoneName,
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  })
                else
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Text(
                        'NO ZONES ASSIGNED',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Colors.grey,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Additional Info
          Text(
            'SYSTEM METADATA',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(
                context,
              ).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                _MetadataRow(
                  label: 'Full Name',
                  value: profile['fullName'] ?? 'N/A',
                ),
                const Divider(height: 24),
                _MetadataRow(label: 'Phone', value: profile['phone'] ?? 'N/A'),
                const Divider(height: 24),
                _MetadataRow(label: 'Registration Date', value: joinedDate),
                const Divider(height: 24),
                _MetadataRow(
                  label: 'Account Status',
                  value: profile['isActive'] == true ? 'Verified' : 'Suspended',
                  valueColor: profile['isActive'] == true
                      ? Colors.green
                      : Colors.red,
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, size: 20, color: color),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RadarBar extends StatelessWidget {
  final String label;
  final double value;
  final Color color;

  const _RadarBar({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            Text(
              '${(value * 100).toInt()}%',
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: value,
            backgroundColor: Theme.of(
              context,
            ).colorScheme.surfaceContainerHighest,
            color: color,
            minHeight: 6,
          ),
        ),
      ],
    );
  }
}

class _MetadataRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _MetadataRow({
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w900,
            color: valueColor ?? Theme.of(context).colorScheme.onSurface,
          ),
        ),
      ],
    );
  }
}
