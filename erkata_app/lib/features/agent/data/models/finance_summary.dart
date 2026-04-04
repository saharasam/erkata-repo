class FinanceSummary {
  final double aglpAvailable;
  final double aglpPending;
  final double aglpWithdrawn;
  final List<dynamic> history;

  FinanceSummary({
    required this.aglpAvailable,
    required this.aglpPending,
    required this.aglpWithdrawn,
    required this.history,
  });

  factory FinanceSummary.fromJson(Map<String, dynamic> json) {
    return FinanceSummary(
      aglpAvailable: (json['aglpAvailable'] as num?)?.toDouble() ?? 0.0,
      aglpPending: (json['aglpPending'] as num?)?.toDouble() ?? 0.0,
      aglpWithdrawn: (json['aglpWithdrawn'] as num?)?.toDouble() ?? 0.0,
      history: json['history'] as List<dynamic>? ?? [],
    );
  }
}
