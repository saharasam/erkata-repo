import 'package:erkata_app/core/models/request_type.dart';
import 'package:erkata_app/core/models/request_status.dart';
import 'package:intl/intl.dart';

class ServiceRequest {
  final String id;
  final RequestType type;
  final String title;
  final String date;
  final RequestStatus status;
  final String location;
  final String budget;
  final String? description;
  final String? customerName;
  final String? customerPhone;
  final String? createdAt;
  final String? assignmentPushedAt;
  final String? completedAt;
  final String? assignedOperatorId;
  final String? assignedAgentName;
  final String? transactionId;
  final List<String> feedbackAuthorIds;

  ServiceRequest({
    required this.id,
    required this.type,
    required this.title,
    required this.date,
    required this.status,
    required this.location,
    required this.budget,
    this.description,
    this.customerName,
    this.customerPhone,
    this.createdAt,
    this.assignmentPushedAt,
    this.completedAt,
    this.assignedOperatorId,
    this.assignedAgentName,
    this.transactionId,
    this.feedbackAuthorIds = const [],
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    // Detect if this is a nested Match object (common in Agent API)
    final bool isNestedMatch =
        json.containsKey('request') && json['request'] is Map;
    final Map<String, dynamic> dataSource = isNestedMatch
        ? json['request'] as Map<String, dynamic>
        : json;

    // Handle nested customer if present
    final customer = dataSource['customer'] as Map<String, dynamic>?;

    // Handle nested zone if present
    // Handle nested zone safely (can be Map or String from backend)
    String zoneName = 'Unknown Zone';
    final zoneData = dataSource['zone'];
    if (zoneData is Map) {
      zoneName = zoneData['name'] as String? ?? 'Unknown Zone';
    } else if (zoneData is String) {
      zoneName = zoneData;
    }
    final woreda = dataSource['woreda'] as String? ?? '';

    // Format budget
    final raw = dataSource['budget'];
    String budgetStr = 'Negotiable';
    if (raw != null) {
      final budgetNum = double.tryParse(raw.toString());
      if (budgetNum != null && budgetNum > 0) {
        budgetStr = NumberFormat('#,###', 'en_US').format(budgetNum) + ' ETB';
      }
    }

    // Format date
    String formattedDate = 'Recent';
    final dateSource = dataSource['createdAt'] ?? json['assignedAt'];
    if (dateSource != null) {
      try {
        final dt = DateTime.parse(dateSource as String);
        formattedDate = DateFormat('MMM d, yyyy').format(dt);
      } catch (_) {}
    }

    // Robust status parsing with Agent Match mapping
    RequestStatus status = RequestStatus.pending;

    if (isNestedMatch) {
      // Mapping for Agents (Match Status -> UI Status)
      final matchStatus = json['status'] as String?;
      switch (matchStatus?.toLowerCase()) {
        case 'assigned':
          status = RequestStatus.pending; // "Incoming"
          break;
        case 'accepted':
          status = RequestStatus.assigned; // "Active"
          break;
        case 'completed':
          status = RequestStatus.fulfilled; // "Fulfilled" (Agent finished)
          break;
        default:
          status = RequestStatus.pending;
      }
    } else {
      // Direct parsing for Customers/Admins
      final statusStr = json['status'] as String?;
      if (statusStr != null) {
        try {
          status = RequestStatus.values.firstWhere(
            (s) => s.name.toLowerCase() == statusStr.toLowerCase(),
            orElse: () => RequestStatus.pending,
          );
        } catch (_) {
          status = RequestStatus.pending;
        }
      }
    }

    // Extract assigned agent name, transaction ID, and feedback info if available
    String? assignedAgent;
    String? transactionId;
    List<String> feedbackAuthorIds = [];
    final matches = dataSource['matches'] as List?;
    if (matches != null && matches.isNotEmpty && matches[0] is Map) {
      final match = matches[0] as Map<String, dynamic>;
      final agent = match['agent'] as Map<String, dynamic>?;
      assignedAgent = agent?['fullName'] as String?;

      final transaction = match['transaction'] as Map<String, dynamic>?;
      transactionId = transaction?['id'] as String?;

      if (transaction != null && transaction['feedbacks'] is List) {
        final feedbacks = transaction['feedbacks'] as List;
        feedbackAuthorIds = feedbacks
            .map((f) => f['authorId'] as String? ?? '')
            .where((id) => id.isNotEmpty)
            .toList();
      }
    }

    return ServiceRequest(
      id:
          json['id'] as String? ??
          '', // Match ID for agents, Request ID for others
      type: dataSource['type'] == 'furniture'
          ? RequestType.furniture
          : RequestType.realEstate,
      title: dataSource['category'] as String? ?? 'Request',
      date: formattedDate,
      status: status,
      location: '$zoneName${woreda.isNotEmpty ? ", Woreda $woreda" : ""}',
      budget: budgetStr,
      description: dataSource['description'] as String?,
      customerName: customer?['fullName'] as String?,
      customerPhone: customer?['phone'] as String?,
      createdAt: dataSource['createdAt'] as String?,
      assignmentPushedAt: json['assignedAt'] as String?,
      completedAt: dataSource['completedAt'] as String?,
      assignedOperatorId: dataSource['assignedOperatorId'] as String?,
      assignedAgentName: assignedAgent,
      transactionId: transactionId,
      feedbackAuthorIds: feedbackAuthorIds,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'category': title,
      'status': status.name,
      'description': description,
    };
  }
}
