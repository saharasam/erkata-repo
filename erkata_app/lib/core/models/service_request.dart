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
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    // Handle nested customer if present
    final customer = json['customer'] as Map<String, dynamic>?;

    // Handle nested zone if present
    final zoneName = json['zone']?['name'] as String? ?? 'Unknown Zone';
    final woreda = json['woreda'] as String? ?? '';

    // Format budget
    final rawMin = json['budgetMin'];
    final rawMax = json['budgetMax'];
    final min = rawMin != null ? num.tryParse(rawMin.toString()) : null;
    final max = rawMax != null ? num.tryParse(rawMax.toString()) : null;
    
    String budgetStr = 'Negotiable';
    if (min != null && max != null) {
      budgetStr = '${min.toInt()} - ${max.toInt()} ETB';
    } else if (min != null) {
      budgetStr = 'Min ${min.toInt()} ETB';
    } else if (max != null) {
      budgetStr = 'Max ${max.toInt()} ETB';
    }

    // Format date
    String formattedDate = 'Recent';
    if (json['createdAt'] != null) {
      try {
        final dt = DateTime.parse(json['createdAt'] as String);
        formattedDate = DateFormat('MMM d, yyyy').format(dt);
      } catch (_) {}
    }

    // Robust status parsing
    RequestStatus status = RequestStatus.pending;
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

    // Extract assigned agent name if available
    String? assignedAgent;
    final matches = json['matches'] as List?;
    if (matches != null && matches.isNotEmpty) {
      final agent = matches[0]['agent'] as Map<String, dynamic>?;
      assignedAgent = agent?['fullName'] as String?;
    }

    return ServiceRequest(
      id: json['id'] as String? ?? '',
      type: json['type'] == 'furniture'
          ? RequestType.furniture
          : RequestType.realEstate,
      title: json['category'] as String? ?? 'Request',
      date: formattedDate,
      status: status,
      location: '$zoneName${woreda.isNotEmpty ? ", Woreda $woreda" : ""}',
      budget: budgetStr,
      description: json['description'] as String?,
      customerName: customer?['fullName'] as String?,
      customerPhone: customer?['phone'] as String?,
      createdAt: json['createdAt'] as String?,
      assignmentPushedAt: json['assignmentPushedAt'] as String?,
      completedAt: json['completedAt'] as String?,
      assignedOperatorId: json['assignedOperatorId'] as String?,
      assignedAgentName: assignedAgent,
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
