import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:erkata_app/core/constants/constants.dart';
import 'package:erkata_app/core/models/request_status.dart';
import 'package:erkata_app/core/models/service_request.dart';
import 'package:erkata_app/core/models/request_type.dart';
import 'package:erkata_app/core/theme/colors.dart';

class RequestStatusScreen extends HookWidget {
  const RequestStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final selectedRequest = useState<ServiceRequest?>(null);

    // Detail View
    if (selectedRequest.value != null) {
      return _RequestDetailView(
        request: selectedRequest.value!,
        onClose: () => selectedRequest.value = null,
      );
    }

    // List View
    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        title: const Text(
          'Activity',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.primaryNavy,
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.grey),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: mockRequests.length,
        separatorBuilder: (_, __) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final req = mockRequests[index];
          return GestureDetector(
            onTap: () => selectedRequest.value = req,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[100]!),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 4,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: req.type == RequestType.property
                          ? Colors.blue[50]
                          : Colors.orange[50],
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        req.type == RequestType.property ? '🏠' : '🛋️',
                        style: const TextStyle(fontSize: 20),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Flexible(
                              child: Text(
                                req.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              req.date,
                              style: TextStyle(
                                color: Colors.grey[400],
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '#${req.id}',
                              style: TextStyle(
                                color: Colors.grey[400],
                                fontSize: 12,
                              ),
                            ),
                            _StatusBadge(status: req.status),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.chevron_right, color: Colors.grey),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final RequestStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;

    switch (status) {
      case RequestStatus.newRequest:
        bg = Colors.grey[100]!;
        text = Colors.grey[600]!;
        break;
      case RequestStatus.inProgress:
        bg = AppColors.successGreen.withOpacity(0.1);
        text = AppColors.successGreen;
        break;
      case RequestStatus.fulfilled:
        bg = AppColors.successGreen;
        text = Colors.white;
        break;
      default:
        bg = Colors.grey[100]!;
        text = Colors.grey[600]!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.label.toUpperCase(),
        style: TextStyle(
          color: text,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _RequestDetailView extends StatelessWidget {
  final ServiceRequest request;
  final VoidCallback onClose;

  const _RequestDetailView({required this.request, required this.onClose});

  @override
  Widget build(BuildContext context) {
    // Mock steps
    final steps = [
      {
        'label': 'Request Submitted',
        'date': 'Oct 24, 10:00 AM',
        'status': 'completed',
        'desc': 'Your request has been received.',
      },
      {
        'label': 'Agent Assigned',
        'date': 'Oct 24, 02:30 PM',
        'status': 'completed',
        'desc': 'Dawit M. is handling your case.',
      },
      {
        'label': 'Searching',
        'date': 'In Progress',
        'status': 'current',
        'desc': 'Agent is verifying availability.',
      },
      {
        'label': 'Fulfilled',
        'date': 'Pending',
        'status': 'pending',
        'desc': 'Items delivered / Contract signed.',
      },
    ];

    return Scaffold(
      backgroundColor: AppColors.offWhite,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primaryNavy),
          onPressed: onClose,
        ),
        title: const Text(
          'Track Request',
          style: TextStyle(
            color: AppColors.primaryNavy,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.primaryNavy),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Summary Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(color: Colors.black12, blurRadius: 10),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        request.title,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      _StatusBadge(status: request.status),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'ID: #${request.id}',
                    style: TextStyle(color: Colors.grey[500], fontSize: 14),
                  ),
                  Text(
                    request.location,
                    style: TextStyle(color: Colors.grey[500], fontSize: 14),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Timeline
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: steps.length,
              itemBuilder: (context, index) {
                final step = steps[index];
                final isCompleted = step['status'] == 'completed';
                final isCurrent = step['status'] == 'current';

                return IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SizedBox(
                        width: 40,
                        child: Column(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: isCompleted
                                    ? AppColors.successGreen.withOpacity(0.1)
                                    : (isCurrent
                                          ? AppColors.successGreen
                                          : Colors.grey[100]),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white,
                                  width: 2,
                                ),
                                boxShadow: [
                                  if (isCurrent)
                                    BoxShadow(
                                      color: AppColors.successGreen.withOpacity(
                                        0.4,
                                      ),
                                      blurRadius: 8,
                                    ),
                                ],
                              ),
                              child: Icon(
                                isCompleted
                                    ? Icons.check
                                    : (isCurrent
                                          ? Icons.access_time
                                          : Icons.circle_outlined),
                                size: 16,
                                color: isCompleted
                                    ? AppColors.successGreen
                                    : (isCurrent
                                          ? Colors.white
                                          : Colors.grey[300]),
                              ),
                            ),
                            if (index < steps.length - 1)
                              Expanded(
                                child: Container(
                                  width: 2,
                                  color: Colors.grey[200],
                                ),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 32),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    step['label'] as String,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: isCurrent
                                          ? AppColors.successGreen
                                          : Colors.black87,
                                    ),
                                  ),
                                  Text(
                                    step['date'] as String,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[500],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                step['desc'] as String,
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  side: BorderSide(color: Colors.grey[300]!),
                ),
                child: const Text(
                  'Contact Agent',
                  style: TextStyle(color: Colors.black87),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
