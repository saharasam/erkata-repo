import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import '../../core/theme/colors.dart';
import '../../core/models/user_role.dart';

class FeedbackFormScreen extends HookWidget {
  final String requestId;
  final String recipientName;
  final UserRole role;

  const FeedbackFormScreen({
    super.key,
    required this.requestId,
    required this.recipientName,
    required this.role,
  });

  @override
  Widget build(BuildContext context) {
    final rating = useState(0);
    final commentController = useTextEditingController();
    final selectedCategories = useState<List<String>>([]);
    final isSubmitted = useState(false);

    final categories = role == UserRole.agent
        ? [
            'Timeliness',
            'Document Quality',
            'Communication',
            'Zone Accuracy',
            'Professionalism',
          ]
        : [
            'Clear Requirements',
            'Prompt Payment',
            'Responsiveness',
            'Fair Specification',
            'Politeness',
          ];

    void toggleCategory(String category) {
      if (selectedCategories.value.contains(category)) {
        selectedCategories.value = selectedCategories.value
            .where((c) => c != category)
            .toList();
      } else {
        selectedCategories.value = [...selectedCategories.value, category];
      }
    }

    if (isSubmitted.value) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: const BoxDecoration(
                    color: AppColors.successGreenLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle,
                    size: 48,
                    color: AppColors.successGreen,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Feedback Received!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.brandPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Thank you for providing your feedback. It has been securely sent to our regional operator for verification.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.darkGrey, fontSize: 16),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.brandPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      'Return to Dashboard',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Submit Feedback',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.brandPrimary,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.brandPrimary),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'How would you rate your experience with $recipientName?',
              style: const TextStyle(color: AppColors.darkGrey, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              'Request: $requestId',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppColors.mediumGrey,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 32),

            // Star Rating
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starValue = index + 1;
                return GestureDetector(
                  onTap: () => rating.value = starValue,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(
                      Icons.star,
                      size: 48,
                      color: rating.value >= starValue
                          ? AppColors.brandGold
                          : AppColors.softGrey,
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 48),

            const Text(
              'WHAT WENT WELL?',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppColors.mediumGrey,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: categories.map((category) {
                final isSelected = selectedCategories.value.contains(category);
                return GestureDetector(
                  onTap: () => toggleCategory(category),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.brandPrimary
                          : AppColors.pureWhite,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.brandPrimary
                            : AppColors.softGrey,
                      ),
                    ),
                    child: Text(
                      category,
                      style: TextStyle(
                        color: isSelected
                            ? AppColors.pureWhite
                            : AppColors.darkGrey,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 32),

            const Text(
              'ADDITIONAL COMMENTS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: commentController,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: 'Share details about your experience...',
                hintStyle: const TextStyle(color: AppColors.mediumGrey),
                filled: true,
                fillColor: AppColors.bgLight,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: rating.value == 0
                    ? null
                    : () => isSubmitted.value = true,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brandPrimary,
                  disabledBackgroundColor: AppColors.softGrey,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Submit to Operator',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.pureWhite,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.infoBlueLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.info_outline,
                    size: 18,
                    color: AppColors.infoBlue,
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Note: Your feedback is part of the 5-step escalation chain. It will be bundled with the other party\'s feedback before being reviewed by management.',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.infoBlue,
                        height: 1.5,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
