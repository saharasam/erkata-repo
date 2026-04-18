import 'package:flutter/material.dart';
import 'package:erkata_app/core/models/request_type.dart';
import 'package:erkata_app/core/models/service_request.dart';
import 'package:erkata_app/core/theme/colors.dart';
import 'erkata_status_badge.dart';

/// A standardized card for displaying a [ServiceRequest] summary.
///
/// Used in [HomeScreen] (compact list style) and [RequestStatusScreen]
/// (image card style). The [showImage] flag toggles between the two layouts.
///
/// Usage:
/// ```dart
/// // With image (Activities screen style)
/// ErkataRequestCard(request: req, onTap: () {}, showImage: true)
///
/// // Without image (Home screen list style)
/// ErkataRequestCard(request: req, onTap: () {})
/// ```
class ErkataRequestCard extends StatelessWidget {
  final ServiceRequest request;
  final VoidCallback onTap;

  /// When true, shows a photo header above the card content (Activities style).
  /// When false, shows a compact row layout used on the home screen.
  final bool showImage;

  static const _propertyImageUrl =
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhjbYgA0zDCprIiCjUZ_u9zudXAkCc0_uxJM-KtfNoFk0P8ZCRQJC3gFygYd55L_vSbYl5Hf7OMgnK0ZW3TJEGNAVKv5xFdO397yNTM8qPb3oVDmDt7zK1ORX_mQB189EXVO4kP9S09ndpnsJJGiPAajcUUPVROk_TaxedTXOkvGCk8kyw9OzTrboQyK-cYlEqPMYAryBM9ReBze5OL6gmairMmlDocWt0nPjoMfFTiPCPGV3ra-Da-JThYZF7-7mQ6YJPMzOA29NQ';
  static const _furnitureImageUrl =
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGAXc3Mbyc4713K5yW5fQOPPIvXHXHh7wuFWxHxPnz_E5pAV7WbbcNGoVO9vXTtimgOswpsZIOKFaNnJEaRq44F9e7XyVxIx98lgCp-c2hwjWYEOPM_Iieuv7InM4dhj1kL19A4vthjQXa67aXJjegD4ZIOfD4OdSQSwc4jvSVaA76p9j-cgiL3R0JvTJMs0fAtq2CZsGt_OViUC3a_gkt6ijN8D4uYvWJre3EfOZZTI7FJkXXV0QDtjjoPHjV9zkrVSxK1adT9-qm';

  const ErkataRequestCard({
    super.key,
    required this.request,
    required this.onTap,
    this.showImage = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.offWhite),
              boxShadow: [
                BoxShadow(
                  color: AppColors.charcoal.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: showImage ? _imageLayout() : _compactLayout(),
          ),
        ),
      ),
    );
  }

  Widget _imageLayout() {
    final imageUrl = request.type == RequestType.realEstate
        ? _propertyImageUrl
        : _furnitureImageUrl;

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          SizedBox(
            height: 120,
            width: double.infinity,
            child: Image.network(imageUrl, fit: BoxFit.cover),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      request.type.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.charcoal,
                      ),
                    ),
                    ErkataStatusBadge(status: request.status),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      size: 12,
                      color: AppColors.mediumGrey,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Submitted on ${request.date}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.mediumGrey,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.infoBlueLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        request.budget,
                        style: const TextStyle(
                          color: AppColors.brandPrimary,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      size: 12,
                      color: AppColors.mediumGrey,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      request.location,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.mediumGrey,
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

  Widget _compactLayout() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ErkataStatusBadge(status: request.status),
              Text(
                request.date,
                style: const TextStyle(
                  color: AppColors.mediumGrey,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            request.title,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 16,
              color: AppColors.charcoal,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.location_on, size: 14, color: AppColors.mediumGrey),
              const SizedBox(width: 4),
              Text(
                request.location,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.mediumGrey,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.infoBlueLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  request.budget,
                  style: const TextStyle(
                    color: AppColors.brandPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
