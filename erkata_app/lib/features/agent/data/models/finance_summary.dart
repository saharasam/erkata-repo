class FinanceSummary {
  final double aglpBalance;
  final double aglpPending;
  final double aglpWithdrawn;
  final int totalReferrals;
  final int completedJobs;
  final List<Map<String, dynamic>> history;

  FinanceSummary({
    required this.aglpBalance,
    required this.aglpPending,
    required this.aglpWithdrawn,
    required this.totalReferrals,
    required this.completedJobs,
    required this.history,
  });

  factory FinanceSummary.fromJson(Map<String, dynamic> json) {
    return FinanceSummary(
      aglpBalance: (json['aglpBalance'] as num?)?.toDouble() ??
          (json['aglpAvailable'] as num?)?.toDouble() ??
          0.0,
      aglpPending: (json['aglpPending'] as num?)?.toDouble() ?? 0.0,
      aglpWithdrawn: (json['aglpWithdrawn'] as num?)?.toDouble() ?? 0.0,
      totalReferrals: (json['totalReferrals'] as int?) ?? 0,
      completedJobs: (json['completedJobs'] as int?) ?? 0,
      history: (json['history'] as List<dynamic>?)
              ?.map((e) => e as Map<String, dynamic>)
              .toList() ??
          [],
    );
  }
}
