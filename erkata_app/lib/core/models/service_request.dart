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
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    // Handle nested customer if present
    final customer = json['customer'] as Map<String, dynamic>?;
    
    // Handle nested zone if present
    final zoneName = json['zone']?['name'] as String? ?? 'Unknown Zone';
    final woreda = json['woreda'] as String? ?? '';
    
    // Format budget
    final min = json['budgetMin'] as num?;
    final max = json['budgetMax'] as num?;
    String budgetStr = 'Negotiable';
    if (min != null && max != null) {
      budgetStr = '${min.toInt()} - ${max.toInt()} ETB';
    } else if (min != null) {
      budgetStr = 'Min ${min.toInt()} ETB';
    }

    // Format date
    String formattedDate = 'Recent';
    if (json['createdAt'] != null) {
      try {
        final dt = DateTime.parse(json['createdAt'] as String);
        formattedDate = DateFormat('MMM d, yyyy').format(dt);
      } catch (_) {}
    }

    return ServiceRequest(
      id: json['id'] as String,
      type: json['type'] == 'furniture' 
          ? RequestType.furniture 
          : RequestType.realEstate,
      title: json['category'] as String? ?? 'Request',
      date: formattedDate,
      status: RequestStatus.values.firstWhere(
        (s) => s.name == (json['status'] as String),
        orElse: () => RequestStatus.pending,
      ),
      location: '$zoneName${woreda.isNotEmpty ? ", Woreda $woreda" : ""}',
      budget: budgetStr,
      description: json['description'] as String?,
      customerName: customer?['fullName'] as String?,
      customerPhone: customer?['phone'] as String?,
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
