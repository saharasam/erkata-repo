import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../../../core/constants/constants.dart';
import '../../../core/models/request_type.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/erkata_screen_header.dart';
import '../../../shared/widgets/erkata_dropdown.dart';
import '../../auth/state/auth_provider.dart';
import '../data/repositories/request_repository.dart';
import '../state/customer_requests_provider.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

// Form Data Model
class RequestFormData {
  RequestType? type;
  String furnitureContext;
  List<String> furnitureCategories;
  int quantity;
  String condition;
  String propertyType;
  int bedrooms;
  String kifleKetema;
  String wereda;
  String address;
  int budgetMin;
  int budgetMax;
  String urgency;
  String deliveryDate;
  String notes;
  int attachments;

  RequestFormData({
    this.type,
    this.furnitureContext = 'Home',
    this.furnitureCategories = const [],
    this.quantity = 1,
    this.condition = 'New',
    this.propertyType = 'Apartment',
    this.bedrooms = 1,
    this.kifleKetema = '',
    this.wereda = '',
    this.address = '',
    this.budgetMin = 5000,
    this.budgetMax = 50000,
    this.urgency = 'Standard',
    this.deliveryDate = '',
    this.notes = '',
    this.attachments = 0,
  });

  RequestFormData copyWith({
    RequestType? type,
    String? furnitureContext,
    List<String>? furnitureCategories,
    int? quantity,
    String? condition,
    String? propertyType,
    int? bedrooms,
    String? kifleKetema,
    String? wereda,
    String? address,
    int? budgetMin,
    int? budgetMax,
    String? urgency,
    String? deliveryDate,
    String? notes,
    int? attachments,
  }) {
    return RequestFormData(
      type: type ?? this.type,
      furnitureContext: furnitureContext ?? this.furnitureContext,
      furnitureCategories: furnitureCategories ?? this.furnitureCategories,
      quantity: quantity ?? this.quantity,
      condition: condition ?? this.condition,
      propertyType: propertyType ?? this.propertyType,
      bedrooms: bedrooms ?? this.bedrooms,
      kifleKetema: kifleKetema ?? this.kifleKetema,
      wereda: wereda ?? this.wereda,
      address: address ?? this.address,
      budgetMin: budgetMin ?? this.budgetMin,
      budgetMax: budgetMax ?? this.budgetMax,
      urgency: urgency ?? this.urgency,
      deliveryDate: deliveryDate ?? this.deliveryDate,
      notes: notes ?? this.notes,
      attachments: attachments ?? this.attachments,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type?.name,
      'furnitureContext': furnitureContext,
      'furnitureCategories': furnitureCategories,
      'quantity': quantity,
      'condition': condition,
      'propertyType': propertyType,
      'bedrooms': bedrooms,
      'kifleKetema': kifleKetema,
      'wereda': wereda,
      'address': address,
      'budgetMin': budgetMin,
      'budgetMax': budgetMax,
      'urgency': urgency,
      'deliveryDate': deliveryDate,
      'notes': notes,
      'attachments': attachments,
    };
  }

  factory RequestFormData.fromJson(Map<String, dynamic> json) {
    RequestType? parsedType;
    if (json['type'] != null) {
      parsedType = RequestType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => RequestType.furniture,
      );
    }
    
    return RequestFormData(
      type: parsedType,
      furnitureContext: json['furnitureContext'] ?? 'Home',
      furnitureCategories: List<String>.from(json['furnitureCategories'] ?? []),
      quantity: json['quantity'] ?? 1,
      condition: json['condition'] ?? 'New',
      propertyType: json['propertyType'] ?? 'Apartment',
      bedrooms: json['bedrooms'] ?? 1,
      kifleKetema: json['kifleKetema'] ?? '',
      wereda: json['wereda'] ?? '',
      address: json['address'] ?? '',
      budgetMin: json['budgetMin'] ?? 5000,
      budgetMax: json['budgetMax'] ?? 50000,
      urgency: json['urgency'] ?? 'Standard',
      deliveryDate: json['deliveryDate'] ?? '',
      notes: json['notes'] ?? '',
      attachments: json['attachments'] ?? 0,
    );
  }
}

class RequestIntakeScreen extends HookConsumerWidget {
  const RequestIntakeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final step = useState(1);
    final totalSteps = 5;
    final formData = useState(RequestFormData());

    // Page Controller for transitions
    final pageController = usePageController();
    final isLoading = useState(false);
    final isInitialized = useState(false);

    // Draft handling
    Future<void> saveDraft(RequestFormData data, int currentStep) async {
      try {
        final prefs = await SharedPreferences.getInstance();
        final jsonData = jsonEncode(data.toJson());
        await prefs.setString('erkata_pending_request', jsonData);
        await prefs.setInt('erkata_pending_request_step', currentStep);
      } catch (e) {
        debugPrint('Failed to save draft: $e');
      }
    }

    Future<void> loadDraft() async {
      try {
        final prefs = await SharedPreferences.getInstance();
        final savedData = prefs.getString('erkata_pending_request');
        final savedStep = prefs.getInt('erkata_pending_request_step');
        
        if (savedData != null) {
          final decoded = jsonDecode(savedData);
          formData.value = RequestFormData.fromJson(decoded);
          if (savedStep != null && savedStep > 1 && savedStep <= totalSteps) {
            step.value = savedStep;
          }
        }
      } catch (e) {
        debugPrint('Failed to load draft: $e');
      } finally {
        isInitialized.value = true;
      }
    }

    Future<void> clearDraft() async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('erkata_pending_request');
      await prefs.remove('erkata_pending_request_step');
    }

    // Load initial draft
    useEffect(() {
      loadDraft();
      return null;
    }, []);

    // Save draft on change
    useEffect(() {
      if (isInitialized.value) {
        saveDraft(formData.value, step.value);
      }
      return null;
    }, [formData.value, step.value]);

    // Sync PageController with step state
    useEffect(() {
      if (pageController.hasClients) {
        pageController.animateToPage(
          step.value - 1,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      }
      return null;
    }, [step.value]);

    Future<void> submitRequest() async {
      final authState = ref.read(authProvider);
      if (!authState.isAuthenticated) {
        context.go('/auth');
        return;
      }

      isLoading.value = true;
      try {
        final data = formData.value;
        
        // Map form to Backend DTO
        final zoneLabel = kKifleKetemas
            .firstWhere((k) => k.value == data.kifleKetema, orElse: () => kKifleKetemas.first)
            .label;

        final payload = {
          'category': data.type == RequestType.realEstate 
              ? data.propertyType 
              : data.furnitureContext,
          'type': data.type == RequestType.realEstate ? 'real_estate' : 'furniture',
          'details': {
            'description': data.notes,
            'budgetMin': data.budgetMin,
            'budgetMax': data.budgetMax,
            'bedrooms': data.bedrooms,
            'quantity': data.quantity,
            'condition': data.condition,
            'furnitureCategories': data.furnitureCategories,
          },
          'locationZone': {
            'kifleKetema': zoneLabel,
            'woreda': data.wereda,
          },
        };

        await ref.read(requestRepositoryProvider).createRequest(payload);
        
        // Refresh the customer history
        ref.read(customerRequestsProvider.notifier).refresh();
        
        await clearDraft();

        if (context.mounted) {
          context.go('/request/status');
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to submit: $e')),
          );
        }
      } finally {
        if (context.mounted) {
          isLoading.value = false;
        }
      }
    }

    void handleNext() {
      if (step.value < totalSteps) {
        step.value++;
      } else {
        submitRequest();
      }
    }

    void handleBack() {
      if (step.value > 1) {
        step.value--;
      } else {
        context.pop();
      }
    }

    bool isNextDisabled() {
      if (isLoading.value) return true;
      if (step.value == 1 && formData.value.type == null) return true;
      if (step.value == 2 &&
          formData.value.type == RequestType.furniture &&
          formData.value.furnitureCategories.isEmpty) {
        return true;
      }
      if (step.value == 3 &&
          (formData.value.kifleKetema.isEmpty ||
              formData.value.wereda.isEmpty)) {
        return true;
      }
      return false;
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: _getTitle(step.value, formData.value.type),
              subtitle: 'Step ${step.value} of $totalSteps',
              onActionTap: handleBack,
            ),
            _StepIndicator(currentStep: step.value, totalSteps: totalSteps),
            const SizedBox(height: 8),
            Expanded(
              child: Column(
                children: [
                  Expanded(
                    child: PageView(
                      controller: pageController,
                      physics: const NeverScrollableScrollPhysics(),
                      children: [
                        _Step1TypeSelection(
                          formData: formData,
                          onNext: handleNext,
                        ),
                        _Step2Specifications(formData),
                        _Step3Location(formData),
                        _Step4Budget(formData),
                        _Step5Review(formData),
                      ],
                    ),
                  ),
                  if (step.value != 1)
                    Container(
                      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        boxShadow: [
                          BoxShadow(
                            color: Theme.of(
                              context,
                            ).shadowColor.withValues(alpha: 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, -4),
                          ),
                        ],
                      ),
                      child: PrimaryButton(
                        text: step.value == totalSteps
                            ? 'Submit Request'
                            : 'Continue',
                        isEnabled: !isNextDisabled(),
                        onPressed: handleNext,
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

  String _getTitle(int step, RequestType? type) {
    if (step == 1) return 'New Request';
    if (step == 2) return '${type?.label ?? ""} Details';
    if (step == 3) return 'Location';
    if (step == 4) return 'Budget & Extras';
    return 'Review';
  }
}

// Sub-widgets for steps (Simplified for brevity, would be full widgets in real code)

class _Step1TypeSelection extends HookWidget {
  final ValueNotifier<RequestFormData> formData;
  final VoidCallback onNext;
  const _Step1TypeSelection({required this.formData, required this.onNext});

  @override
  Widget build(BuildContext context) {
    // Animation controller for staggered entry
    final animationController = useAnimationController(
      duration: const Duration(milliseconds: 1200),
    );

    useEffect(() {
      animationController.forward();
      return null;
    }, []);

    // Staggered animations
    final titleAnimation = CurvedAnimation(
      parent: animationController,
      curve: const Interval(0.0, 0.4, curve: Curves.easeOut),
    );

    final propertyAnimation = CurvedAnimation(
      parent: animationController,
      curve: const Interval(0.2, 0.7, curve: Curves.easeOutBack),
    );

    final furnitureAnimation = CurvedAnimation(
      parent: animationController,
      curve: const Interval(0.4, 0.9, curve: Curves.easeOutBack),
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          FadeTransition(
            opacity: titleAnimation,
            child: Text(
              'What do you need?',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface,
                letterSpacing: -0.5,
              ),
            ),
          ),
          const SizedBox(height: 8),
          FadeTransition(
            opacity: titleAnimation,
            child: Text(
              'Select a category to get started',
              style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          const SizedBox(height: 32),
          // Property Card
          AnimatedBuilder(
            animation: propertyAnimation,
            builder: (context, child) {
              return Transform.translate(
                offset: Offset(0, 50 * (1 - propertyAnimation.value)),
                child: Opacity(
                  opacity: propertyAnimation.value.clamp(0.0, 1.0),
                  child: child,
                ),
              );
            },
            child: _SelectionCard(
              label: 'Property',
              icon: Icons.home_rounded,
              isSelected: formData.value.type == RequestType.realEstate,
              onTap: () {
                formData.value = formData.value.copyWith(
                  type: RequestType.realEstate,
                );
                // Delay slightly for visual feedback
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
          ),
          const SizedBox(height: 16),
          // Furniture Card
          AnimatedBuilder(
            animation: furnitureAnimation,
            builder: (context, child) {
              return Transform.translate(
                offset: Offset(0, 50 * (1 - furnitureAnimation.value)),
                child: Opacity(
                  opacity: furnitureAnimation.value.clamp(0.0, 1.0),
                  child: child,
                ),
              );
            },
            child: _SelectionCard(
              label: 'Furniture',
              icon: Icons.chair_rounded,
              isSelected: formData.value.type == RequestType.furniture,
              onTap: () {
                formData.value = formData.value.copyWith(
                  type: RequestType.furniture,
                );
                // Delay slightly for visual feedback
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
          ),
          const SizedBox(height: 40),
          // Returning User Link
          Center(
            child: TextButton(
              onPressed: () => context.go('/auth'),
              child: RichText(
                text: TextSpan(
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontSize: 14,
                  ),
                  children: [
                    const TextSpan(text: 'Already have an account? '),
                    TextSpan(
                      text: 'Log in',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SelectionCard extends HookWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _SelectionCard({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isHovered = useState(false);
    final isPressed = useState(false);
    final scale = isPressed.value ? 0.95 : (isHovered.value ? 1.02 : 1.0);

    return MouseRegion(
      onEnter: (_) => isHovered.value = true,
      onExit: (_) => isHovered.value = false,
      child: GestureDetector(
        onTapDown: (_) => isPressed.value = true,
        onTapUp: (_) {
          isPressed.value = false;
          onTap();
        },
        onTapCancel: () => isPressed.value = false,
        child: AnimatedScale(
          scale: scale,
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeInOut,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isSelected
                  ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.1)
                  : Theme.of(context).colorScheme.surface,
              border: Border.all(
                color: isSelected ? AppColors.brandPrimary : Colors.transparent,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: isSelected
                      ? Theme.of(
                          context,
                        ).colorScheme.primary.withValues(alpha: 0.2)
                      : Theme.of(context).shadowColor.withValues(
                          alpha: isHovered.value ? 0.08 : 0.03,
                        ),
                  blurRadius: isSelected || isHovered.value ? 12 : 8,
                  offset: Offset(0, isSelected || isHovered.value ? 6 : 2),
                ),
              ],
            ),
            child: Column(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Theme.of(
                            context,
                          ).colorScheme.primary.withValues(alpha: 0.2)
                        : Theme.of(context).colorScheme.surfaceContainerHighest,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    size: 32,
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                AnimatedDefaultTextStyle(
                  duration: const Duration(milliseconds: 200),
                  style: TextStyle(
                    fontFamily: 'Inter', // Default system or specified font
                    fontWeight: FontWeight.bold,
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Theme.of(context).colorScheme.onSurface,
                  ),
                  child: Text(label),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Step2Specifications extends StatelessWidget {
  final ValueNotifier<RequestFormData> formData;
  const _Step2Specifications(this.formData);

  static const furnitureSubCategories = {
    'Home': [
      'Sofa',
      'Bed',
      'Dining Table',
      'Coffee Table',
      'Chair',
      'Wardrobe',
      'TV Stand',
    ],
    'Office': [
      'Office Desk',
      'Office Chair',
      'Conference Table',
      'Filing Cabinet',
      'Bookshelf',
      'Reception Desk',
      'Workstation',
    ],
  };

  static const propertyTypes = [
    'Apartment',
    'House',
    'Villa',
    'Condominium',
    'Office Space',
    'Warehouse',
    'Land',
  ];

  @override
  Widget build(BuildContext context) {
    final isFurniture = formData.value.type == RequestType.furniture;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isFurniture ? 'Furniture Details' : 'Property Details',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.onSurface,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isFurniture
                ? 'Tell us more about the furniture you need'
                : 'Tell us more about the property you are looking for',
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 32),
          if (isFurniture) ...[
            // Context (Home/Office)
            const Text(
              'Category',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            Row(
              children: ['Home', 'Office']
                  .map(
                    (ctx) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: _SelectionCard(
                          label: ctx,
                          icon: ctx == 'Home'
                              ? Icons.home_rounded
                              : Icons.business_center_rounded,
                          isSelected: formData.value.furnitureContext == ctx,
                          onTap: () {
                            formData.value = formData.value.copyWith(
                              furnitureContext: ctx,
                              furnitureCategories: [],
                            );
                          },
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 32),
            // Categories
            const Text(
              'Specific Items',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 12,
              children: furnitureSubCategories[formData.value.furnitureContext]!
                  .map((cat) {
                    final isSelected = formData.value.furnitureCategories
                        .contains(cat);
                    return _AnimatedChip(
                      label: cat,
                      isSelected: isSelected,
                      onSelected: (selected) {
                        final cats = List<String>.from(
                          formData.value.furnitureCategories,
                        );
                        if (selected) {
                          cats.add(cat);
                        } else {
                          cats.remove(cat);
                        }
                        formData.value = formData.value.copyWith(
                          furnitureCategories: cats,
                        );
                      },
                    );
                  })
                  .toList(),
            ),
            const SizedBox(height: 32),
            // Quantity Selection
            _QuantitySelector(
              label: 'Quantity',
              value: formData.value.quantity,
              onChanged: (val) =>
                  formData.value = formData.value.copyWith(quantity: val),
            ),
          ] else ...[
            // Property Type
            const Text(
              'Property Type',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 12,
              children: propertyTypes.map((type) {
                final isSelected = formData.value.propertyType == type;
                return _AnimatedChip(
                  label: type,
                  isSelected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      formData.value = formData.value.copyWith(
                        propertyType: type,
                      );
                    }
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
            // Bedrooms
            if (formData.value.propertyType != 'Land' &&
                formData.value.propertyType != 'Warehouse')
              _QuantitySelector(
                label: 'Bedrooms',
                subtitle: 'Select number of bedrooms',
                value: formData.value.bedrooms,
                onChanged: (val) =>
                    formData.value = formData.value.copyWith(bedrooms: val),
                minValue: 0,
                maxValue: 10,
                zeroLabel: 'Studio',
              ),
          ],
        ],
      ),
    );
  }
}

class _QuantitySelector extends StatelessWidget {
  final String label;
  final String? subtitle;
  final int value;
  final ValueChanged<int> onChanged;
  final int minValue;
  final int maxValue;
  final String? zeroLabel;

  const _QuantitySelector({
    required this.label,
    this.subtitle,
    required this.value,
    required this.onChanged,
    this.minValue = 1,
    this.maxValue = 99,
    this.zeroLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: TextStyle(fontSize: 12, color: AppColors.mediumGrey),
                  ),
              ],
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                _IconButton(
                  icon: Icons.remove,
                  onPressed: value > minValue
                      ? () => onChanged(value - 1)
                      : null,
                ),
                SizedBox(
                  width: 60,
                  child: Center(
                    child: Text(
                      (value == 0 && zeroLabel != null) ? zeroLabel! : '$value',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                  ),
                ),
                _IconButton(
                  icon: Icons.add,
                  onPressed: value < maxValue
                      ? () => onChanged(value + 1)
                      : null,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _IconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;

  const _IconButton({required this.icon, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onPressed,
      icon: Icon(icon),
      color: Theme.of(context).colorScheme.primary,
      disabledColor: Theme.of(
        context,
      ).colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
    );
  }
}

class _Step3Location extends StatelessWidget {
  final ValueNotifier<RequestFormData> formData;
  const _Step3Location(this.formData);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Location',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          ErkataDropdown<String>(
            label: 'Sub-City',
            hint: 'Select Sub-City',
            value: formData.value.kifleKetema.isEmpty
                ? null
                : formData.value.kifleKetema,
            items: kKifleKetemas.map((k) => k.value).toList(),
            itemLabel: (val) =>
                kKifleKetemas.firstWhere((k) => k.value == val).label,
            onChanged: (val) {
              if (val != null) {
                formData.value = formData.value.copyWith(
                  kifleKetema: val,
                  wereda: '',
                );
              }
            },
          ),
          const SizedBox(height: 24),
          if (formData.value.kifleKetema.isNotEmpty)
            ErkataDropdown<String>(
              label: 'Wereda',
              hint: 'Select Wereda',
              value: formData.value.wereda.isEmpty
                  ? null
                  : formData.value.wereda,
              items: kKifleKetemas
                  .firstWhere((k) => k.value == formData.value.kifleKetema)
                  .weredas,
              itemLabel: (val) => val,
              onChanged: (val) {
                if (val != null) {
                  formData.value = formData.value.copyWith(wereda: val);
                }
              },
            ),
        ],
      ),
    );
  }
}

class _Step4Budget extends StatelessWidget {
  final ValueNotifier<RequestFormData> formData;
  const _Step4Budget(this.formData);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Budget',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Maximum Budget',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '${formData.value.budgetMax} ETB',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurface,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: Theme.of(context).colorScheme.primary,
              inactiveTrackColor: Theme.of(context).colorScheme.outlineVariant,
              thumbColor: Theme.of(context).colorScheme.primary,
              overlayColor: Theme.of(
                context,
              ).colorScheme.primary.withValues(alpha: 0.1),
              trackHeight: 6,
            ),
            child: Slider(
              min: 1000,
              max: 200000,
              divisions: 200,
              value: formData.value.budgetMax.toDouble(),
              onChanged: (val) => formData.value = formData.value.copyWith(
                budgetMax: val.toInt(),
              ),
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Additional Notes',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            maxLines: 4,
            decoration: InputDecoration(
              hintText: 'Any specific details we should know?',
              hintStyle: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              filled: true,
              fillColor: Theme.of(context).colorScheme.surface,
              contentPadding: const EdgeInsets.all(16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.outline,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.outline,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(
                  color: AppColors.brandGold,
                  width: 2,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Step5Review extends StatelessWidget {
  final ValueNotifier<RequestFormData> formData;
  const _Step5Review(this.formData);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Review',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(
              color: AppColors.deepNavy,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppColors.deepNavy.withValues(alpha: 0.2),
                  blurRadius: 16,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(24),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite.withValues(alpha: 0.24),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          formData.value.type == RequestType.furniture
                              ? Icons.chair
                              : Icons.home,
                          color: AppColors.brandGold,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              formData.value.type?.label ?? 'Request',
                              style: const TextStyle(
                                color: AppColors.pureWhite,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'Summary',
                              style: TextStyle(
                                color: AppColors.pureWhite.withValues(
                                  alpha: 0.8,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      _row(
                        'Item/Type',
                        formData.value.type == RequestType.furniture
                            ? formData.value.furnitureCategories.join(', ')
                            : '${formData.value.propertyType}${formData.value.bedrooms > 0 ? " (${formData.value.bedrooms} BR)" : ""}',
                      ),
                      Divider(
                        color: AppColors.pureWhite.withValues(alpha: 0.24),
                        height: 32,
                      ),
                      _row(
                        'Location',
                        '${formData.value.kifleKetema}\n${formData.value.wereda}',
                      ),
                      Divider(
                        color: AppColors.pureWhite.withValues(alpha: 0.24),
                        height: 32,
                      ),
                      _row(
                        'Budget',
                        '${formData.value.budgetMax} ETB',
                        valueColor: AppColors.brandGold,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value, {Color? valueColor}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: TextStyle(color: AppColors.pureWhite.withValues(alpha: 0.6)),
          ),
        ),
        Expanded(
          flex: 3,
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              color: valueColor ?? AppColors.pureWhite,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
      ],
    );
  }
}

class _StepIndicator extends StatelessWidget {
  final int currentStep;
  final int totalSteps;

  const _StepIndicator({required this.currentStep, required this.totalSteps});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
      child: Stack(
        children: [
          // Background Track
          Container(
            height: 4,
            margin: const EdgeInsets.symmetric(
              vertical: 18,
            ), // Center with 40px nodes
            decoration: BoxDecoration(
              color: Theme.of(
                context,
              ).colorScheme.outlineVariant.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Animated Progress Line
          LayoutBuilder(
            builder: (context, constraints) {
              final stepWidth = constraints.maxWidth / (totalSteps - 1);
              final progressWidth = (currentStep - 1) * stepWidth;

              return AnimatedContainer(
                duration: const Duration(milliseconds: 400),
                curve: Curves.easeInOutCubic,
                height: 4,
                width: progressWidth,
                margin: const EdgeInsets.symmetric(vertical: 18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Theme.of(context).colorScheme.primary,
                      AppColors.brandGold,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(2),
                  boxShadow: [
                    BoxShadow(
                      color: Theme.of(
                        context,
                      ).colorScheme.primary.withValues(alpha: 0.3),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
              );
            },
          ),

          // Step Nodes
          SizedBox(
            height: 40,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(totalSteps, (index) {
                final stepNum = index + 1;
                final isCompleted = stepNum < currentStep;
                final isActive = stepNum == currentStep;

                return _StepNode(
                  stepNumber: stepNum,
                  isActive: isActive,
                  isCompleted: isCompleted,
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

class _StepNode extends StatelessWidget {
  final int stepNumber;
  final bool isActive;
  final bool isCompleted;

  const _StepNode({
    required this.stepNumber,
    required this.isActive,
    required this.isCompleted,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutCubic,
      width: isActive ? 40 : 32,
      height: isActive ? 40 : 32,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isCompleted
            ? AppColors.brandGold
            : (isActive ? colorScheme.primary : colorScheme.surface),
        border: Border.all(
          color: isActive || isCompleted
              ? Colors.transparent
              : colorScheme.outlineVariant,
          width: 2,
        ),
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: colorScheme.primary.withValues(alpha: 0.4),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ]
            : (isCompleted
                  ? [
                      BoxShadow(
                        color: AppColors.brandGold.withValues(alpha: 0.2),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ]
                  : null),
      ),
      child: Center(
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: isCompleted
              ? Icon(
                  Icons.check_rounded,
                  key: const ValueKey('check'),
                  size: isActive ? 20 : 18,
                  color: AppColors.brandPrimary,
                )
              : Text(
                  '$stepNumber',
                  key: ValueKey('text_$stepNumber'),
                  style: TextStyle(
                    color: isActive
                        ? colorScheme.onPrimary
                        : colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.bold,
                    fontSize: isActive ? 16 : 14,
                  ),
                ),
        ),
      ),
    );
  }
}

class _AnimatedChip extends HookWidget {
  final String label;
  final bool isSelected;
  final ValueChanged<bool> onSelected;

  const _AnimatedChip({
    required this.label,
    required this.isSelected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final isPressed = useState(false);

    return GestureDetector(
      onTapDown: (_) => isPressed.value = true,
      onTapUp: (_) {
        isPressed.value = false;
        onSelected(!isSelected);
      },
      onTapCancel: () => isPressed.value = false,
      child: AnimatedScale(
        scale: isPressed.value ? 0.92 : 1.0,
        duration: const Duration(milliseconds: 150),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: isSelected
                ? Theme.of(context).colorScheme.primary
                : Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.outlineVariant,
            ),
            boxShadow: [
              if (isSelected)
                BoxShadow(
                  color: Theme.of(
                    context,
                  ).colorScheme.primary.withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
            ],
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected
                  ? Theme.of(context).colorScheme.onPrimary
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}
