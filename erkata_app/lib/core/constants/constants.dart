import 'package:erkata_app/core/models/location_option.dart';
import 'package:erkata_app/core/models/service_request.dart';
import 'package:erkata_app/core/models/request_type.dart';
import 'package:erkata_app/core/models/request_status.dart';

List<LocationOption> get kKifleKetemas => [
  LocationOption(
    value: 'bole',
    label: 'Bole',
    weredas: ['01', '02', '03', 'Bole Arabsa'],
  ),
  LocationOption(
    value: 'yeka',
    label: 'Yeka',
    weredas: ['Ayat', 'CMC', 'Kotebe'],
  ),
  LocationOption(
    value: 'kirkos',
    label: 'Kirkos',
    weredas: ['Kazanchis', 'Meskel Square'],
  ),
  LocationOption(value: 'arada', label: 'Arada', weredas: ['Piazza', '4 Kilo']),
  LocationOption(
    value: 'lideta',
    label: 'Lideta',
    weredas: ['Mexico', 'Lideta Condominium'],
  ),
];

List<ServiceRequest> get mockRequests => [
  ServiceRequest(
    id: 'REQ-2023-001',
    type: RequestType.furniture,
    title: 'Custom Sofa Set (L-Shape)',
    date: 'Oct 24, 2023',
    status: RequestStatus.assigned,
    location: 'Bole, Wereda 03',
    budget: '25,000 - 35,000 ETB',
  ),
  ServiceRequest(
    id: 'REQ-2023-002',
    type: RequestType.realEstate,
    title: '2 Bedroom Apartment Rental',
    date: 'Oct 20, 2023',
    status: RequestStatus.pending,
    location: 'Yeka, Ayat',
    budget: '15,000 ETB/mo',
  ),
  ServiceRequest(
    id: 'REQ-2023-003',
    type: RequestType.furniture,
    title: 'Dining Table (Mahogany)',
    date: 'Sep 15, 2023',
    status: RequestStatus.fulfilled,
    location: 'Kirkos',
    budget: '12,000 ETB',
  ),
];
