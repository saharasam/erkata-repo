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
import '../data/models/request_form_data.dart';

class RequestIntakeScreen extends HookConsumerWidget {
  const RequestIntakeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final step = useState(1);
    final totalSteps = 8;
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

    // Mark as launched on first entry so it doesn't reappear on restart if abandoned
    useEffect(() {
      ref.read(authProvider.notifier).markAsLaunched();
      return null;
    }, []);

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
        // Mark as launched so returning users aren't forced into intake
        await ref.read(authProvider.notifier).markAsLaunched();
        if (context.mounted) {
          context.go('/auth', extra: {'isLogin': false});
        }
        return;
      }

      isLoading.value = true;
      try {
        final payload = formData.value.toBackendPayload();

        await ref.read(requestRepositoryProvider).createRequest(payload);

        // Refresh the customer history
        ref.read(customerRequestsProvider.notifier).refresh();

        await clearDraft();

        if (context.mounted) {
          context.go('/request/status');
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Failed to submit: $e')));
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
      final data = formData.value;
      if (step.value == 1 && data.intent == null) return true;
      if (step.value == 2 && data.type == null) return true;
      if (step.value == 3) {
        if (data.type == RequestType.realEstate &&
            data.constructionStatus == null) {
          return true;
        }
        if (data.type == RequestType.furniture && data.customization == null) {
          return true;
        }
      }
      if (step.value == 4) {
        if (data.type == RequestType.realEstate && data.bedrooms == null) {
          return true;
        }
        if (data.type == RequestType.furniture && data.targetRoom == null) {
          return true;
        }
      }
      if (step.value == 5) {
        if (data.type == RequestType.realEstate && data.bankLoan == null) {
          return true;
        }
        if (data.type == RequestType.furniture && data.paymentPlan == null) {
          return true;
        }
      }
      if (step.value == 6 &&
          (data.kifleKetema.isEmpty || data.wereda.isEmpty)) {
        return true;
      }
      if (step.value == 7 && data.budgetMax <= 0) return true;
      return false;
    }

    final authState = ref.watch(authProvider);
    final isFirstLaunch = authState.isFirstLaunch;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            if (!isFirstLaunch)
              ErkataScreenHeader(
                title: _getTitle(step.value, formData.value.type),
                subtitle: 'Step ${step.value} of $totalSteps',
                onActionTap: handleBack,
              ),
            if (!isFirstLaunch)
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
                        _Step1IntentSelection(
                          formData: formData,
                          onNext: handleNext,
                          isFirstLaunch: isFirstLaunch,
                        ),
                        _Step2TypeSelection(
                          formData: formData,
                          onNext: handleNext,
                        ),
                        _Step3PathQ1(formData: formData, onNext: handleNext),
                        _Step4PathQ2(formData: formData, onNext: handleNext),
                        _Step5PathQ3(formData: formData, onNext: handleNext),
                        _Step6Location(formData: formData, onNext: handleNext),
                        _Step7Budget(formData: formData, onNext: handleNext),
                        _Step8Review(formData: formData),
                      ],
                    ),
                  ),
                  if ((isFirstLaunch && step.value == totalSteps) ||
                      (!isFirstLaunch && step.value != 1))
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
    switch (step) {
      case 1:
        return 'Request Intent';
      case 2:
        return 'Category';
      case 3:
        return type == RequestType.realEstate
            ? 'Property Status'
            : 'Manufacturing';
      case 4:
        return type == RequestType.realEstate ? 'Bedrooms' : 'Target Room';
      case 5:
        return type == RequestType.realEstate ? 'Financial' : 'Payment Plan';
      case 6:
        return 'Location';
      case 7:
        return 'Budget';
      case 8:
        return 'Review';
      default:
        return 'New Request';
    }
  }
}

// --- STEP 1: INTENT SELECTION ---
class _Step1IntentSelection extends HookWidget {
  final ValueNotifier<RequestFormData> formData;
  final VoidCallback onNext;
  final bool isFirstLaunch;
  const _Step1IntentSelection({
    required this.formData,
    required this.onNext,
    this.isFirstLaunch = false,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _StepHeader(
            title: 'What do you need?',
            subtitle: 'Select an intent to get started',
          ),
          const SizedBox(height: 32),
          _SelectionCard(
            title: 'I want to Buy / Find',
            description:
                'Looking for property or items? We\'ll find them for you.',
            icon: Icons.shopping_bag_rounded,
            isSelected: formData.value.intent == 'buy',
            onTap: () {
              formData.value = formData.value.copyWith(intent: 'buy');
              Future.delayed(const Duration(milliseconds: 200), onNext);
            },
          ),
          const SizedBox(height: 16),
          _SelectionCard(
            title: 'I want to Sell / List',
            description: 'Want to list your assets? Start here.',
            icon: Icons.trending_up_rounded,
            isSelected: formData.value.intent == 'sell',
            dark: true,
            onTap: () {
              formData.value = formData.value.copyWith(intent: 'sell');
              Future.delayed(const Duration(milliseconds: 200), onNext);
            },
          ),
          if (!isFirstLaunch) ...[const SizedBox(height: 40), _LoginLink()],
        ],
      ),
    );
  }
}

// --- STEP 2: CATEGORY SELECTION ---
class _Step2TypeSelection extends HookWidget {
  final ValueNotifier<RequestFormData> formData;
  final VoidCallback onNext;
  const _Step2TypeSelection({required this.formData, required this.onNext});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _StepHeader(
            title: 'Select Category',
            subtitle: 'What kind of request is this?',
          ),
          const SizedBox(height: 32),
          _SelectionCard(
            title: 'Home / Real Estate',
            description: 'Houses, apartments, lands, or villas.',
            icon: Icons.home_rounded,
            isSelected: formData.value.type == RequestType.realEstate,
            onTap: () {
              formData.value = formData.value.copyWith(
                type: RequestType.realEstate,
              );
              Future.delayed(const Duration(milliseconds: 200), onNext);
            },
          ),
          const SizedBox(height: 16),
          _SelectionCard(
            title: 'Furniture',
            description: 'Sofa sets, beds, office furniture, etc.',
            icon: Icons.chair_rounded,
            isSelected: formData.value.type == RequestType.furniture,
            onTap: () {
              formData.value = formData.value.copyWith(
                type: RequestType.furniture,
              );
              Future.delayed(const Duration(milliseconds: 200), onNext);
            },
          ),
        ],
      ),
    );
  }
}

// --- STEP 3: PATH Q1 (Status / Customization) ---
class _Step3PathQ1 extends StatelessWidget {
  final ValueNotifier<RequestFormData> formData;
  final VoidCallback onNext;
  const _Step3PathQ1({required this.formData, required this.onNext});

  @override
  Widget build(BuildContext context) {
    final isHome = formData.value.type == RequestType.realEstate;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          _StepHeader(
            title: isHome
                ? 'Current status of the house?'
                : 'Preference for manufacturing?',
            center: true,
          ),
          const SizedBox(height: 32),
          if (isHome) ...[
            _SelectionCard(
              title: 'Under Construction',
              icon: Icons.build_rounded,
              isSelected:
                  formData.value.constructionStatus == 'Under Construction',
              onTap: () {
                formData.value = formData.value.copyWith(
                  constructionStatus: 'Under Construction',
                );
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
            const SizedBox(height: 16),
            _SelectionCard(
              title: 'Completed',
              icon: Icons.check_circle_rounded,
              isSelected: formData.value.constructionStatus == 'Completed',
              onTap: () {
                formData.value = formData.value.copyWith(
                  constructionStatus: 'Completed',
                );
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
          ] else ...[
            _SelectionCard(
              title: 'Custom-made',
              icon: Icons.handyman_rounded,
              isSelected: formData.value.customization == 'Custom-made',
              onTap: () {
                formData.value = formData.value.copyWith(
                  customization: 'Custom-made',
                );
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
            const SizedBox(height: 16),
            _SelectionCard(
              title: 'Ready-made',
              icon: Icons.shopping_cart_rounded,
              isSelected: formData.value.customization == 'Ready-made',
              onTap: () {
                formData.value = formData.value.copyWith(
                  customization: 'Ready-made',
                );
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
          ],
        ],
      ),
    );
  }
}

// --- STEP 4: PATH Q2 (Bedrooms / Target Room) ---
class _Step4PathQ2 extends StatelessWidget {
  final ValueNotifier<RequestFormData> formData;
  final VoidCallback onNext;
  const _Step4PathQ2({required this.formData, required this.onNext});

  @override
  Widget build(BuildContext context) {
    final isHome = formData.value.type == RequestType.realEstate;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          _StepHeader(
            title: isHome ? 'Number of bedrooms?' : 'For which room?',
            center: true,
          ),
          const SizedBox(height: 32),
          if (isHome)
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: ['Studio', '1', '2', '3', '4+', 'Penthouse'].map((
                option,
              ) {
                final isSelected = formData.value.bedrooms == option;
                return InkWell(
                  onTap: () {
                    formData.value = formData.value.copyWith(bedrooms: option);
                    Future.delayed(const Duration(milliseconds: 200), onNext);
                  },
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isSelected
                          ? Theme.of(
                              context,
                            ).colorScheme.primary.withValues(alpha: 0.1)
                          : Theme.of(context).colorScheme.surface,
                      border: Border.all(
                        color: isSelected
                            ? AppColors.brandPrimary
                            : Theme.of(context).colorScheme.outlineVariant,
                        width: 2,
                      ),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.bed_rounded,
                          color: isSelected
                              ? AppColors.brandPrimary
                              : Colors.grey,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          option == 'Penthouse'
                              ? 'Penthouse'
                              : '$option Bedroom',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isSelected
                                ? AppColors.brandPrimary
                                : Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            )
          else
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.2,
              children: ['Living room', 'Bedroom', 'Office', 'Kitchen'].map((
                room,
              ) {
                final isSelected = formData.value.targetRoom == room;
                return InkWell(
                  onTap: () {
                    formData.value = formData.value.copyWith(targetRoom: room);
                    Future.delayed(const Duration(milliseconds: 200), onNext);
                  },
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? Theme.of(
                              context,
                            ).colorScheme.primary.withValues(alpha: 0.1)
                          : Theme.of(context).colorScheme.surface,
                      border: Border.all(
                        color: isSelected
                            ? AppColors.brandPrimary
                            : Theme.of(context).colorScheme.outlineVariant,
                        width: 2,
                      ),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Text(
                      room,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: isSelected
                            ? AppColors.brandPrimary
                            : Colors.black87,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }
}

// --- STEP 5: PATH Q3 (Bank Loan / Payment Plan) ---
class _Step5PathQ3 extends StatelessWidget {
  final ValueNotifier<RequestFormData> formData;
  final VoidCallback onNext;
  const _Step5PathQ3({required this.formData, required this.onNext});

  @override
  Widget build(BuildContext context) {
    final isHome = formData.value.type == RequestType.realEstate;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          _StepHeader(
            title: isHome
                ? 'Do you require a bank loan?'
                : 'Do you require a payment plan?',
            center: true,
          ),
          const SizedBox(height: 32),
          if (isHome) ...[
            _SelectionCard(
              title: 'Yes, Required',
              icon: Icons.credit_card_rounded,
              isSelected: formData.value.bankLoan == 'Yes',
              onTap: () {
                formData.value = formData.value.copyWith(bankLoan: 'Yes');
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
            const SizedBox(height: 16),
            _SelectionCard(
              title: 'No, Cash / Other',
              icon: Icons.payments_rounded,
              isSelected: formData.value.bankLoan == 'No',
              onTap: () {
                formData.value = formData.value.copyWith(bankLoan: 'No');
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
          ] else ...[
            _SelectionCard(
              title: 'Yes, Installments',
              icon: Icons.calendar_month_rounded,
              isSelected: formData.value.paymentPlan == 'Yes',
              onTap: () {
                formData.value = formData.value.copyWith(paymentPlan: 'Yes');
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
            const SizedBox(height: 16),
            _SelectionCard(
              title: 'No, Upfront',
              icon: Icons.money_rounded,
              isSelected: formData.value.paymentPlan == 'No',
              onTap: () {
                formData.value = formData.value.copyWith(paymentPlan: 'No');
                Future.delayed(const Duration(milliseconds: 200), onNext);
              },
            ),
          ],
        ],
      ),
    );
  }
}

// --- STEP 6: LOCATION ---
class _Step6Location extends HookWidget {
  final ValueNotifier<RequestFormData> formData;
  final VoidCallback onNext;
  const _Step6Location({required this.formData, required this.onNext});

  @override
  Widget build(BuildContext context) {
    final woredaOptions = [
      'Woreda 01',
      'Woreda 02',
      'Woreda 03',
      'Woreda 04',
      'Woreda 05',
      'Others',
    ];
    final isOtherWoreda = useState(
      formData.value.wereda.isNotEmpty &&
          !woredaOptions.sublist(0, 5).contains(formData.value.wereda),
    );
    final otherController = useTextEditingController(
      text: isOtherWoreda.value ? formData.value.wereda : '',
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _StepHeader(
            title: formData.value.type == RequestType.realEstate
                ? 'Preferred Location?'
                : 'Where should we deliver?',
            center: true,
          ),
          const SizedBox(height: 32),
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
                formData.value = formData.value.copyWith(kifleKetema: val);
              }
            },
          ),
          const SizedBox(height: 24),
          ErkataDropdown<String>(
            label: 'Woreda / Specific Spot',
            hint: 'Select Woreda',
            value: isOtherWoreda.value
                ? 'Others'
                : (formData.value.wereda.isEmpty
                      ? null
                      : formData.value.wereda),
            items: woredaOptions,
            itemLabel: (val) => val,
            onChanged: (val) {
              if (val == 'Others') {
                isOtherWoreda.value = true;
                formData.value = formData.value.copyWith(wereda: '');
              } else if (val != null) {
                isOtherWoreda.value = false;
                formData.value = formData.value.copyWith(wereda: val);
              }
            },
          ),
          if (isOtherWoreda.value) ...[
            const SizedBox(height: 24),
            Text(
              'Specify Other Location',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: otherController,
              decoration: InputDecoration(
                hintText: 'e.g. Old Airport, Near Bole bulbula',
                filled: true,
                fillColor: Colors.grey.shade50,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(32),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (val) {
                formData.value = formData.value.copyWith(wereda: val);
              },
            ),
          ],
          const SizedBox(height: 40),
          PrimaryButton(text: 'Continue to Budget', onPressed: onNext),
        ],
      ),
    );
  }
}

// --- STEP 7: BUDGET ---
class _Step7Budget extends HookWidget {
  final ValueNotifier<RequestFormData> formData;
  final VoidCallback onNext;
  const _Step7Budget({required this.formData, required this.onNext});

  @override
  Widget build(BuildContext context) {
    final controller = useTextEditingController(
      text: formData.value.budgetMax > 0
          ? formData.value.budgetMax.toString()
          : '',
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _StepHeader(
            title: 'What is your planned budget? (ETB)',
            center: true,
          ),
          const SizedBox(height: 40),
          TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: 'e.g. 5,000,000',
              suffixIcon: const Icon(
                Icons.payments_rounded,
                size: 32,
                color: Colors.grey,
              ),
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Colors.grey.shade200, width: 4),
              ),
              focusedBorder: const UnderlineInputBorder(
                borderSide: BorderSide(color: AppColors.brandPrimary, width: 4),
              ),
            ),
            onChanged: (val) {
              final budget = int.tryParse(val) ?? 0;
              formData.value = formData.value.copyWith(budgetMax: budget);
            },
          ),
          const SizedBox(height: 60),
          PrimaryButton(text: 'Last Step: Additional Info', onPressed: onNext),
        ],
      ),
    );
  }
}

// --- STEP 8: REVIEW & DETAILS ---
class _Step8Review extends HookWidget {
  final ValueNotifier<RequestFormData> formData;
  const _Step8Review({required this.formData});

  @override
  Widget build(BuildContext context) {
    final noteController = useTextEditingController(text: formData.value.notes);
    final isHome = formData.value.type == RequestType.realEstate;

    final zoneLabel = formData.value.kifleKetema.isEmpty
        ? 'Not selected'
        : kKifleKetemas
              .firstWhere(
                (k) => k.value == formData.value.kifleKetema,
                orElse: () => kKifleKetemas.first,
              )
              .label;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _StepHeader(title: 'Any additional requirements?', center: true),
          const SizedBox(height: 24),
          TextField(
            controller: noteController,
            maxLines: 4,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Add notes here...',
              hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
              filled: true,
              fillColor: AppColors.deepNavy,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(32),
                borderSide: BorderSide.none,
              ),
            ),
            onChanged: (val) {
              formData.value = formData.value.copyWith(notes: val);
            },
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.deepNavy,
              borderRadius: BorderRadius.circular(32),
            ),
            child: Column(
              children: [
                _SummaryRow(
                  label: 'Intent',
                  value: formData.value.intent == 'buy'
                      ? 'Buy / Find'
                      : 'Sell / List',
                ),
                _SummaryRow(
                  label: 'Category',
                  value: isHome ? 'Home / Real Estate' : 'Furniture',
                ),
                if (isHome) ...[
                  _SummaryRow(
                    label: 'Status',
                    value: formData.value.constructionStatus ?? '',
                  ),
                  _SummaryRow(
                    label: 'Bedrooms',
                    value: formData.value.bedrooms ?? '',
                  ),
                  _SummaryRow(
                    label: 'Bank Loan',
                    value: formData.value.bankLoan ?? '',
                  ),
                ] else ...[
                  _SummaryRow(
                    label: 'Manufacturing',
                    value: formData.value.customization ?? '',
                  ),
                  _SummaryRow(
                    label: 'Room',
                    value: formData.value.targetRoom ?? '',
                  ),
                  _SummaryRow(
                    label: 'Payment Plan',
                    value: formData.value.paymentPlan ?? '',
                  ),
                ],
                _SummaryRow(
                  label: 'Location',
                  value: '$zoneLabel, ${formData.value.wereda}',
                ),
                _SummaryRow(
                  label: 'Budget',
                  value: '${formData.value.budgetMax} ETB',
                  valueColor: AppColors.brandGold,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// --- HELPER COMPONENTS ---

class _StepHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool center;

  const _StepHeader({required this.title, this.subtitle, this.center = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: center
          ? CrossAxisAlignment.center
          : CrossAxisAlignment.start,
      children: [
        Text(
          title,
          textAlign: center ? TextAlign.center : TextAlign.left,
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.onSurface,
            letterSpacing: -0.5,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 8),
          Text(
            subtitle!,
            textAlign: center ? TextAlign.center : TextAlign.left,
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ],
    );
  }
}

class _SelectionCard extends StatelessWidget {
  final String title;
  final String? description;
  final IconData icon;
  final bool isSelected;
  final bool dark;
  final VoidCallback onTap;

  const _SelectionCard({
    required this.title,
    this.description,
    required this.icon,
    required this.isSelected,
    this.dark = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bgColor = isSelected
        ? theme.colorScheme.primary.withValues(alpha: 0.1)
        : (dark ? AppColors.deepNavy : Colors.white);

    final borderColor = isSelected
        ? AppColors.brandPrimary
        : (dark ? Colors.transparent : Colors.grey.shade100);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: borderColor, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: dark
                    ? Colors.white.withValues(alpha: 0.1)
                    : AppColors.brandPrimary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                icon,
                color: dark ? Colors.white : AppColors.brandPrimary,
                size: 28,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: dark ? Colors.white : Colors.grey.shade900,
              ),
            ),
            if (description != null) ...[
              const SizedBox(height: 8),
              Text(
                description!,
                style: TextStyle(
                  fontSize: 14,
                  color: dark ? Colors.grey.shade400 : Colors.grey.shade500,
                ),
              ),
            ],
            const SizedBox(height: 24),
            Row(
              children: [
                Text(
                  'Select',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: dark ? AppColors.brandGold : AppColors.brandPrimary,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  Icons.chevron_right_rounded,
                  size: 18,
                  color: dark ? AppColors.brandGold : AppColors.brandPrimary,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                color: valueColor ?? Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoginLink extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: TextButton(
        onPressed: () => context.go('/auth', extra: {'isLogin': true}),
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
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: currentStep / totalSteps,
              backgroundColor: Colors.grey.shade100,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.brandPrimary,
              ),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                'Step $currentStep of $totalSteps',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade400,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
