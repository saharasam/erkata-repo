import { LocationOption, RequestStatus, RequestType, ServiceRequest } from './types';

export const KIFLE_KETEMAS: LocationOption[] = [
  { value: 'bole', label: 'Bole', weredas: ['01', '02', '03', 'Bole Arabsa'] },
  { value: 'yeka', label: 'Yeka', weredas: ['Ayat', 'CMC', 'Kotebe'] },
  { value: 'kirkos', label: 'Kirkos', weredas: ['Kazanchis', 'Meskel Square'] },
  { value: 'arada', label: 'Arada', weredas: ['Piazza', '4 Kilo'] },
  { value: 'lideta', label: 'Lideta', weredas: ['Mexico', 'Lideta Condominium'] },
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: 'REQ-2023-001',
    type: RequestType.FURNITURE,
    title: 'Custom Sofa Set (L-Shape)',
    date: 'Oct 24, 2023',
    status: RequestStatus.IN_PROGRESS,
    location: 'Bole, Wereda 03',
    budget: '25,000 - 35,000 ETB'
  },
  {
    id: 'REQ-2023-002',
    type: RequestType.PROPERTY,
    title: '2 Bedroom Apartment Rental',
    date: 'Oct 20, 2023',
    status: RequestStatus.NEW,
    location: 'Yeka, Ayat',
    budget: '15,000 ETB/mo'
  },
  {
    id: 'REQ-2023-003',
    type: RequestType.FURNITURE,
    title: 'Dining Table (Mahogany)',
    date: 'Sep 15, 2023',
    status: RequestStatus.FULFILLED,
    location: 'Kirkos',
    budget: '12,000 ETB'
  }
];