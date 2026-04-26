import 'package:flutter/material.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../data/repositories/agent_repository.dart';
import '../../auth/state/auth_provider.dart';

class AgentBusinessVerificationScreen extends HookConsumerWidget {
  const AgentBusinessVerificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    
    final tinController = useTextEditingController(text: user?.tinNumber ?? '');
    final licenseController = useTextEditingController(text: user?.tradeLicenseNumber ?? '');
    final isLoading = useState(false);
    final formKey = useMemoized(() => GlobalKey<FormState>());

    // Note: In a real app, these fields might be at the root of the user object 
    // depending on how the backend returns them. 
    // We added them to the Profile model, so they should be available in user object.

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'Business Verification',
              subtitle: 'Verify your business details',
              onActionTap: () => context.pop(),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primaryContainer.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.info_outline,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Complete your business verification to unlock higher referral limits and priority assignments.',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Theme.of(context).colorScheme.onSurface,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      
                      Text(
                        'Business Details',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      TextFormField(
                        controller: tinController,
                        decoration: const InputDecoration(
                          labelText: 'TIN Number',
                          hintText: 'Enter your 10-digit TIN',
                          prefixIcon: Icon(Icons.tag),
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                      ),
                      const SizedBox(height: 20),
                      
                      TextFormField(
                        controller: licenseController,
                        decoration: const InputDecoration(
                          labelText: 'Trade License Number',
                          hintText: 'Enter your business license number',
                          prefixIcon: Icon(Icons.description_outlined),
                          border: OutlineInputBorder(),
                        ),
                        validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                      ),
                      const SizedBox(height: 32),
                      
                      Text(
                        'Documents (Coming Soon)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        height: 120,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Theme.of(context).colorScheme.outlineVariant,
                            style: BorderStyle.solid,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.cloud_upload_outlined, color: Colors.grey[400]),
                            const SizedBox(height: 8),
                            Text(
                              'Document upload is disabled in MVP',
                              style: TextStyle(color: Colors.grey[500], fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 40),
                      
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton(
                          onPressed: isLoading.value ? null : () async {
                            if (formKey.currentState!.validate()) {
                              isLoading.value = true;
                              try {
                                await ref.read(agentRepositoryProvider).updateBusinessProfile(
                                  tinController.text,
                                  licenseController.text,
                                );
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Business details updated!')),
                                  );
                                  context.pop();
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Error: ${e.toString()}')),
                                  );
                                }
                              } finally {
                                isLoading.value = false;
                              }
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            foregroundColor: Theme.of(context).colorScheme.onPrimary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: isLoading.value 
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text('Save Details', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
