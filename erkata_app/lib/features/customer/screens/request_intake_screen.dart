import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../../../core/constants/constants.dart';
import '../../../core/models/request_type.dart';
import '../../../core/theme/colors.dart';
import '../../../shared/widgets/primary_button.dart';

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

    final progress = (step.value / totalSteps);

    void handleNext() {
      if (step.value < totalSteps) {
        step.value++;
      } else {
        // Submit
        context.go('/tracking'); // Or similar
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
      if (step.value == 1 && formData.value.type == null) return true;
      if (step.value == 2 &&
          formData.value.type == RequestType.furniture &&
          formData.value.furnitureCategories.isEmpty)
        return true;
      if (step.value == 3 &&
          (formData.value.kifleKetema.isEmpty || formData.value.wereda.isEmpty))
        return true;
      return false;
    }

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        title: Text(_getTitle(step.value, formData.value.type)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: handleBack,
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[200],
            valueColor: const AlwaysStoppedAnimation<Color>(
              AppColors.primaryGold,
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: PageView(
              controller: pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _Step1TypeSelection(formData),
                _Step2Specifications(formData),
                _Step3Location(formData),
                _Step4Budget(formData),
                _Step5Review(formData),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            child: PrimaryButton(
              text: step.value == totalSteps ? 'Submit Request' : 'Continue',
              onPressed: isNextDisabled()
                  ? () {}
                  : handleNext, // TODO: Disable effectively
              // PrimaryButton doesn't support disabled state visually yet (added to task list mentally)
              // We will just disable the callback for now, or wrap in Opacity
            ),
          ),
        ],
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

class _Step1TypeSelection extends StatelessWidget {
  final ValueNotifier<RequestFormData> formData;
  const _Step1TypeSelection(this.formData);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'What are you looking for?',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          _SelectionCard(
            label: 'Property',
            icon: Icons.home,
            isSelected: formData.value.type == RequestType.property,
            onTap: () => formData.value = formData.value.copyWith(
              type: RequestType.property,
            ),
          ),
          const SizedBox(height: 16),
          _SelectionCard(
            label: 'Furniture',
            icon: Icons.chair,
            isSelected: formData.value.type == RequestType.furniture,
            onTap: () => formData.value = formData.value.copyWith(
              type: RequestType.furniture,
            ),
          ),
        ],
      ),
    );
  }
}

class _SelectionCard extends StatelessWidget {
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
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryNavy.withOpacity(0.05)
              : Colors.white,
          border: Border.all(
            color: isSelected ? AppColors.primaryNavy : Colors.grey[200]!,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 40,
              color: isSelected ? AppColors.primaryNavy : Colors.grey,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? AppColors.primaryNavy : Colors.grey[600],
              ),
            ),
          ],
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

  @override
  Widget build(BuildContext context) {
    final isFurniture = formData.value.type == RequestType.furniture;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isFurniture ? 'Furniture Details' : 'Property Details',
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          if (isFurniture) ...[
            // Context
            Row(
              children: ['Home', 'Office']
                  .map(
                    (ctx) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: _SelectionCard(
                          label: ctx,
                          icon: ctx == 'Home'
                              ? Icons.light
                              : Icons.work, // Mock icons
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
            const SizedBox(height: 20),
            // Categories
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: furnitureSubCategories[formData.value.furnitureContext]!
                  .map((cat) {
                    final isSelected = formData.value.furnitureCategories
                        .contains(cat);
                    return FilterChip(
                      label: Text(cat),
                      selected: isSelected,
                      onSelected: (selected) {
                        final cats = List<String>.from(
                          formData.value.furnitureCategories,
                        );
                        if (selected)
                          cats.add(cat);
                        else
                          cats.remove(cat);
                        formData.value = formData.value.copyWith(
                          furnitureCategories: cats,
                        );
                      },
                    );
                  })
                  .toList(),
            ),
            const SizedBox(height: 20),
            // Quantity
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Quantity',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: () => formData.value = formData.value.copyWith(
                        quantity: formData.value.quantity - 1,
                      ),
                      icon: const Icon(Icons.remove),
                    ),
                    Text(
                      '${formData.value.quantity}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      onPressed: () => formData.value = formData.value.copyWith(
                        quantity: formData.value.quantity + 1,
                      ),
                      icon: const Icon(Icons.add),
                    ),
                  ],
                ),
              ],
            ),
          ] else ...[
            // Property Specifics (Mock)
            const Text('Property Type'),
            // ... Similar implementation for property
          ],
        ],
      ),
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
          DropdownButtonFormField<String>(
            value: formData.value.kifleKetema.isEmpty
                ? null
                : formData.value.kifleKetema,
            hint: const Text('Select Sub-City'),
            items: kKifleKetemas
                .map(
                  (k) => DropdownMenuItem(value: k.value, child: Text(k.label)),
                )
                .toList(),
            onChanged: (val) {
              formData.value = formData.value.copyWith(
                kifleKetema: val,
                wereda: '',
              );
            },
            decoration: const InputDecoration(border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          if (formData.value.kifleKetema.isNotEmpty)
            DropdownButtonFormField<String>(
              value: formData.value.wereda.isEmpty
                  ? null
                  : formData.value.wereda,
              hint: const Text('Select Wereda'),
              items: kKifleKetemas
                  .firstWhere((k) => k.value == formData.value.kifleKetema)
                  .weredas
                  .map((w) => DropdownMenuItem(value: w, child: Text(w)))
                  .toList(),
              onChanged: (val) =>
                  formData.value = formData.value.copyWith(wereda: val),
              decoration: const InputDecoration(border: OutlineInputBorder()),
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
          Text('Up to ${formData.value.budgetMax} ETB'),
          Slider(
            min: 1000,
            max: 200000,
            divisions: 200,
            value: formData.value.budgetMax.toDouble(),
            onChanged: (val) => formData.value = formData.value.copyWith(
              budgetMax: val.toInt(),
            ),
          ),
          const SizedBox(height: 20),
          const TextField(
            maxLines: 4,
            decoration: InputDecoration(
              labelText: 'Notes',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
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
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _row('Type', formData.value.type?.label ?? '-'),
                  _row(
                    'Location',
                    '${formData.value.kifleKetema}, ${formData.value.wereda}',
                  ),
                  _row('Budget', '${formData.value.budgetMax} ETB'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
