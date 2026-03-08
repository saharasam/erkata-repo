import 'package:erkata_app/core/models/request_type.dart';
import 'package:erkata_app/core/models/request_status.dart';

class ServiceRequest {
  final String id;
  final RequestType type;
  final String title;
  final String date;
  final RequestStatus status;
  final String location;
  final String budget;

  ServiceRequest({
    required this.id,
    required this.type,
    required this.title,
    required this.date,
    required this.status,
    required this.location,
    required this.budget,
  });
}
