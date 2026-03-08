import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/colors.dart';

class AgentCommissionScreen extends StatelessWidget {
  const AgentCommissionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        title: const Text(
          'Earnings',
          style: TextStyle(
            color: AppColors.primaryNavy,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primaryNavy),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: 120,
        ),
        child: Column(
          children: [
            // Total Earned Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey[100]!),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.green[50],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.trending_up,
                          color: AppColors.successGreen,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Total Revenue',
                        style: TextStyle(
                          color: Colors.grey,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  RichText(
                    text: const TextSpan(
                      text: '45,200 ',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryNavy,
                      ),
                      children: [
                        TextSpan(
                          text: 'ETB',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.normal,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Row(
                    children: [
                      Icon(
                        Icons.arrow_upward,
                        size: 14,
                        color: AppColors.successGreen,
                      ),
                      Text(
                        '12.5% ',
                        style: TextStyle(
                          color: AppColors.successGreen,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      Text(
                        'vs last month',
                        style: TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Weekly Performance Chart
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey[100]!),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Weekly Performance',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryNavy,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const SizedBox(
                    height: 200,
                    width: double.infinity,
                    child: _RevenueChart(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Breakdown Grid
            Row(
              children: [
                Expanded(
                  child: _InfoCard(
                    label: 'Pending',
                    value: '8,500 ETB',
                    valueColor: Colors.orange,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _InfoCard(
                    label: 'Withdrawable',
                    value: '36,700 ETB',
                    valueColor: AppColors.primaryNavy,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Recent Transactions
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'RECENT TRANSACTIONS',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey,
                  letterSpacing: 1.2,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Column(
              children: [
                _TransactionItem(
                  desc: 'Commission - REQ-2023-001',
                  amount: '+ 2,500 ETB',
                  date: 'Today, 10:30 AM',
                  isCredit: true,
                ),
                const SizedBox(height: 12),
                _TransactionItem(
                  desc: 'Payout to Telebirr',
                  amount: '- 10,000 ETB',
                  date: 'Yesterday',
                  isCredit: false,
                ),
                const SizedBox(height: 12),
                _TransactionItem(
                  desc: 'Commission - REQ-2023-005',
                  amount: '+ 1,800 ETB',
                  date: 'Oct 22',
                  isCredit: true,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String label;
  final String value;
  final Color valueColor;

  const _InfoCard({
    required this.label,
    required this.value,
    required this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[100]!),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 2, offset: Offset(0, 1)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }
}

class _TransactionItem extends StatelessWidget {
  final String desc;
  final String amount;
  final String date;
  final bool isCredit;

  // ignore: unused_element
  const _TransactionItem({
    required this.desc,
    required this.amount,
    required this.date,
    required this.isCredit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[100]!),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 2, offset: Offset(0, 1)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isCredit ? Colors.green[50] : Colors.grey[100],
              shape: BoxShape.circle,
            ),
            child: Icon(
              isCredit ? Icons.check_circle_outline : Icons.arrow_downward,
              color: isCredit ? Colors.green : Colors.grey,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  desc,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.darkGrey,
                  ),
                ),
                Text(
                  date,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
          Text(
            amount,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isCredit ? AppColors.successGreen : AppColors.darkGrey,
            ),
          ),
        ],
      ),
    );
  }
}

class _RevenueChart extends StatelessWidget {
  const _RevenueChart();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(size: Size.infinite, painter: _ChartPainter());
  }
}

class _ChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final data = [1200, 2100, 1800, 2800, 2400, 3800, 3200];
    final max = 4200.0; // slightly above 3800

    final paint = Paint()
      ..color = AppColors.successGreen
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final fillPaint = Paint()
      ..style = PaintingStyle.fill
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          AppColors.successGreen.withOpacity(0.2),
          AppColors.successGreen.withOpacity(0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final path = Path();
    final fillPath = Path();

    // Grid lines
    final gridPaint = Paint()
      ..color = Colors.grey[200]!
      ..strokeWidth = 1;
    canvas.drawLine(
      Offset(0, size.height),
      Offset(size.width, size.height),
      gridPaint,
    );
    canvas.drawLine(
      Offset(0, size.height / 2),
      Offset(size.width, size.height / 2),
      gridPaint,
    );
    canvas.drawLine(const Offset(0, 0), Offset(size.width, 0), gridPaint);

    final widthStep = size.width / (data.length - 1);

    path.moveTo(0, size.height - (data[0] / max) * size.height);
    fillPath.moveTo(0, size.height); // Start at bottom left
    fillPath.lineTo(0, size.height - (data[0] / max) * size.height);

    for (int i = 1; i < data.length; i++) {
      final x = i * widthStep;
      final y = size.height - (data[i] / max) * size.height;
      path.lineTo(x, y);
      fillPath.lineTo(x, y);

      // Draw dots
      // canvas.drawCircle(Offset(x, y), 4, Paint()..color = Colors.white);
      // canvas.drawCircle(Offset(x, y), 4, Paint()..color = AppColors.successGreen..style = PaintingStyle.stroke..strokeWidth = 2);
    }

    fillPath.lineTo(size.width, size.height);
    fillPath.close();

    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paint);

    // Draw dots on top
    for (int i = 0; i < data.length; i++) {
      final x = i * widthStep;
      final y = size.height - (data[i] / max) * size.height;
      canvas.drawCircle(Offset(x, y), 4, Paint()..color = Colors.white);
      canvas.drawCircle(
        Offset(x, y),
        4,
        Paint()
          ..color = AppColors.successGreen
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
