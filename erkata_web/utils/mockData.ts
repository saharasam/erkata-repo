// Mock data for Agent and Operator dashboards

export interface Request {
  id: string;
  submittedDate: string;
  submittedTime: string;
  requirementSummary: string;
  customerName: string;
  zone: string;
  woreda: string;
  status: "assigned" | "in-progress" | "completed" | "cancelled";
}

export interface Transaction {
  id: string;
  requestId: string;
  agentName: string;
  customerName: string;
  status: "pending" | "in-progress" | "completed" | "awaiting-feedback";
  startedDate: string;
  expectedCompletion?: string;
  daysActive: number;
  bothPartiesResponded: boolean;
}

export interface Earnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  lifetime: number;
}

export interface ReferralData {
  usedSlots: number;
  totalSlots: number;
  successfulThisMonth: number;
  currentTier: string;
  nextTier: string;
  tierExpiry: string;
}

export interface FeedbackBundle {
  id: string;
  transactionId: string;
  dateEscalated: string;
  resolutionStatus: "pending" | "in-review" | "resolved";
}

export interface ZoneActivity {
  woreda: string;
  activeAgents: number;
  requestsSubmitted: number;
  requestsAssigned: number;
}

// Agent Mock Data
export const agentRequests: Request[] = [
  {
    id: "REQ-2024-001",
    submittedDate: "2024-02-13",
    submittedTime: "14:30",
    requirementSummary:
      "Need verification of property title deed at Addis Ababa Land Office",
    customerName: "Abebe M. (masked)",
    zone: "Addis Ababa",
    woreda: "Bole",
    status: "assigned",
  },
  {
    id: "REQ-2024-002",
    submittedDate: "2024-02-13",
    submittedTime: "10:15",
    requirementSummary:
      "Document retrieval from Kirkos Sub-City Administration Office",
    customerName: "Tigist K. (masked)",
    zone: "Addis Ababa",
    woreda: "Kirkos",
    status: "in-progress",
  },
  {
    id: "REQ-2024-003",
    submittedDate: "2024-02-12",
    submittedTime: "16:45",
    requirementSummary: "Birth certificate collection and delivery service",
    customerName: "Samuel T. (masked)",
    zone: "Addis Ababa",
    woreda: "Yeka",
    status: "assigned",
  },
  {
    id: "REQ-2024-004",
    submittedDate: "2024-02-12",
    submittedTime: "09:00",
    requirementSummary:
      "Queue service for passport renewal at Immigration Office",
    customerName: "Meron H. (masked)",
    zone: "Addis Ababa",
    woreda: "Addis Ketema",
    status: "completed",
  },
];

export const agentTransactions: Transaction[] = [
  {
    id: "TXN-2024-101",
    requestId: "REQ-2024-002",
    agentName: "You",
    customerName: "Tigist K.",
    status: "in-progress",
    startedDate: "2024-02-13",
    expectedCompletion: "2024-02-14",
    daysActive: 1,
    bothPartiesResponded: true,
  },
  {
    id: "TXN-2024-099",
    requestId: "REQ-2024-004",
    agentName: "You",
    customerName: "Meron H.",
    status: "awaiting-feedback",
    startedDate: "2024-02-12",
    daysActive: 2,
    bothPartiesResponded: false,
  },
];

export const agentEarnings: Earnings = {
  today: 450,
  thisWeek: 2100,
  thisMonth: 8500,
  pending: 1200,
  lifetime: 45000,
};

export const agentReferrals: ReferralData = {
  usedSlots: 3,
  totalSlots: 7,
  successfulThisMonth: 2,
  currentTier: "Peace",
  nextTier: "Love",
  tierExpiry: "2024-03-31",
};

// Operator Mock Data
export const operatorPendingRequests: Request[] = [
  {
    id: "REQ-2024-010",
    submittedDate: "2024-02-13",
    submittedTime: "18:20",
    requirementSummary: "Legal document notarization service at court",
    customerName: "Dawit S.",
    zone: "Addis Ababa",
    woreda: "Bole",
    status: "assigned",
  },
  {
    id: "REQ-2024-011",
    submittedDate: "2024-02-13",
    submittedTime: "17:45",
    requirementSummary: "University transcript collection from AAU",
    customerName: "Hana W.",
    zone: "Addis Ababa",
    woreda: "Lideta",
    status: "assigned",
  },
  {
    id: "REQ-2024-012",
    submittedDate: "2024-02-13",
    submittedTime: "16:30",
    requirementSummary: "Business license renewal at Trade Office",
    customerName: "Yohannes M.",
    zone: "Addis Ababa",
    woreda: "Kirkos",
    status: "assigned",
  },
  {
    id: "REQ-2024-013",
    submittedDate: "2024-02-13",
    submittedTime: "15:10",
    requirementSummary: "Medical certificate from Tikur Anbessa Hospital",
    customerName: "Bethlehem A.",
    zone: "Addis Ababa",
    woreda: "Arada",
    status: "assigned",
  },
];

export const operatorActiveTransactions: Transaction[] = [
  {
    id: "TXN-2024-201",
    requestId: "REQ-2024-005",
    agentName: "Agent #247",
    customerName: "Wondwossen T.",
    status: "in-progress",
    startedDate: "2024-02-11",
    daysActive: 3,
    bothPartiesResponded: true,
  },
  {
    id: "TXN-2024-202",
    requestId: "REQ-2024-006",
    agentName: "Agent #312",
    customerName: "Selamawit G.",
    status: "awaiting-feedback",
    startedDate: "2024-02-10",
    daysActive: 4,
    bothPartiesResponded: false,
  },
  {
    id: "TXN-2024-203",
    requestId: "REQ-2024-007",
    agentName: "Agent #189",
    customerName: "Kebede L.",
    status: "in-progress",
    startedDate: "2024-02-05",
    daysActive: 9,
    bothPartiesResponded: true,
  },
];

export const operatorFeedbackBundles: FeedbackBundle[] = [
  {
    id: "FB-2024-050",
    transactionId: "TXN-2024-198",
    dateEscalated: "2024-02-12",
    resolutionStatus: "in-review",
  },
  {
    id: "FB-2024-049",
    transactionId: "TXN-2024-195",
    dateEscalated: "2024-02-11",
    resolutionStatus: "resolved",
  },
  {
    id: "FB-2024-048",
    transactionId: "TXN-2024-192",
    dateEscalated: "2024-02-10",
    resolutionStatus: "pending",
  },
];

export const operatorZoneActivity: ZoneActivity[] = [
  {
    woreda: "Bole",
    activeAgents: 12,
    requestsSubmitted: 45,
    requestsAssigned: 38,
  },
  {
    woreda: "Kirkos",
    activeAgents: 8,
    requestsSubmitted: 32,
    requestsAssigned: 29,
  },
  {
    woreda: "Yeka",
    activeAgents: 15,
    requestsSubmitted: 52,
    requestsAssigned: 47,
  },
  {
    woreda: "Arada",
    activeAgents: 10,
    requestsSubmitted: 38,
    requestsAssigned: 35,
  },
  {
    woreda: "Lideta",
    activeAgents: 7,
    requestsSubmitted: 28,
    requestsAssigned: 24,
  },
];
