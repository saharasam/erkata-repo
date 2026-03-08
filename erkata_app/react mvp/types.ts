export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  OPERATOR = 'OPERATOR'
}

export enum ViewState {
  // Auth
  AUTH = 'AUTH',
  
  // Customer Views
  HOME = 'HOME',
  NEW_REQUEST = 'NEW_REQUEST',
  TRACKING = 'TRACKING',
  PAYMENT = 'PAYMENT',
  PROFILE = 'PROFILE',

  // Agent Views
  AGENT_DASHBOARD = 'AGENT_DASHBOARD',
  AGENT_SUBSCRIPTION = 'AGENT_SUBSCRIPTION',
  AGENT_COMMISSION = 'AGENT_COMMISSION',
  AGENT_COMMUNICATION = 'AGENT_COMMUNICATION',

  // Operator Views
  OPERATOR_DASHBOARD = 'OPERATOR_DASHBOARD',
  OPERATOR_ASSIGNMENT = 'OPERATOR_ASSIGNMENT',
  OPERATOR_MEDIATION = 'OPERATOR_MEDIATION'
}

export enum RequestType {
  PROPERTY = 'Property',
  FURNITURE = 'Furniture'
}

export enum RequestStatus {
  NEW = 'New',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In-Progress',
  FULFILLED = 'Fulfilled'
}

export interface ServiceRequest {
  id: string;
  type: RequestType;
  title: string;
  date: string;
  status: RequestStatus;
  location: string;
  budget: string;
}

export interface LocationOption {
  value: string;
  label: string;
  weredas: string[];
}