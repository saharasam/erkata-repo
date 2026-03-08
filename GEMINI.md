# Erkata Platform: LLM Context Document (Source of Truth)

**Version:** 1.0 (High Fidelity)
**Scope:** `erkata_backend`, `erkata_web`, `erkata_app`
**Governance Model:** Erkata Platform Development Advisor (Mandatory Intermediary Model)

---

## 1. System Overview

Erkata is a closed-loop, request-driven brokerage platform for real estate and furniture in Ethiopia. It operates on a **Mandatory Intermediary Model**, where transactions are mediated by Operators to prevent direct agent-customer bypass and ensure market structure.

### Primary Actors

- **Requestors (Sellers/Customers)**: Submit service requirements.
- **Executors (Agents)**: Fulfill requests within restricted geographic zones and subscription tiers.
- **Mediators (Operators)**: Route requests to eligible agents, oversee fulfillment, and collect feedback.
- **Decision Authority (Admins)**: Review bundled feedback and issue binding resolutions.
- **Appellate Authority (Super Admin)**: Platform owner; overrides decisions and manages policy-level conflicts.

### Supported Platforms

- **Web Interface**: Multi-role dashboards (Admin, Operator, Customer, Agent).
- **Mobile App**: Flutter-based implementation primarily focused on Agent and Customer flows.

---

## 2. Architecture Summary

### Backend (`erkata_backend`)

- **Framework**: NestJS (TypeScript).
- **Architectural Pattern**: Modular Monolith with Service-Repository pattern.
- **Data Layer**: Prisma ORM with PostgreSQL.
- **Asynchronous Processing**: BullMQ with Redis for mediation timeouts (e.g., 14-day feedback window).
- **Event Bus**: `EventEmitter2` for decoupled lifecycle events (e.g., `request.created` triggering notifications).

### Web Frontend (`erkata_web`)

- **Framework**: React 18+ (Vite).
- **Styling**: Vanilla CSS with custom design tokens (Premium Aesthetics).
- **State Management**: React Context API (`AuthContext`, `ModalContext`).
- **Routing**: `react-router-dom` with role-based `ProtectedRoute` wrappers.

### Mobile Frontend (`erkata_app`)

- **Framework**: Flutter (Dart).
- **Architecture**: Feature-first structure (Core/Features/Shared).
- **State Management**: `flutter_riverpod` + `hooks_riverpod`.
- **Styling**: Declarative styling via `styled_widget`.

---

## 3. Folder & Module Structure

### 3.1 `erkata_backend` (Backend)

```text
erkata_backend/
├── prisma/
│   ├── migrations/
│   │   └── 20260221151721_request_engine_v2/
│   │       └── migration.sql
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── auth/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── permissions.ts
│   ├── common/
│   │   ├── events/
│   │   │   └── request.events.ts
│   │   └── middleware/
│   ├── mediation/
│   │   ├── mediation.controller.ts
│   │   ├── mediation.module.ts
│   │   ├── mediation.processor.ts
│   │   └── mediation.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── requests/
│   │   ├── requests.controller.ts
│   │   ├── requests.module.ts
│   │   └── requests.service.ts
│   ├── transactions/
│   │   ├── transactions.controller.ts
│   │   ├── transactions.module.ts
│   │   └── transactions.service.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .env
├── nest-cli.json
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

### 3.2 `erkata_web` (Web Frontend)

```text
erkata_web/
├── components/
│   ├── admin/
│   ├── agent/
│   ├── super-admin/
│   ├── ui/
│   ├── CustomSelect.tsx
│   ├── DashboardLayout.tsx
│   ├── Navigation.tsx
│   └── ... (atomic components)
├── contexts/
│   ├── AuthContext.tsx
│   └── ModalContext.tsx
├── pages/
│   ├── About.tsx
│   ├── AdminDashboard.tsx
│   ├── AgentDashboard.tsx
│   ├── Contact.tsx
│   ├── CustomerDashboard.tsx
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── OperatorDashboard.tsx
│   ├── Privacy.tsx
│   ├── Register.tsx
│   ├── RequestIntake.tsx
│   ├── SuperAdminDashboard.tsx
│   └── Terms.tsx
├── utils/
│   ├── api.ts
│   └── mockData.ts
├── App.tsx
├── index.css
├── index.html
├── index.tsx
├── package.json
└── vite.config.ts
```

### 3.3 `erkata_app` (Mobile App)

```text
erkata_app/
├── android/
├── ios/
├── lib/
│   ├── core/
│   │   ├── animations/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── models/
│   │   │   ├── location_option.dart
│   │   │   ├── request_status.dart
│   │   │   ├── request_type.dart
│   │   │   ├── service_request.dart
│   │   │   ├── user_role.dart
│   │   │   └── view_state.dart
│   │   ├── router/
│   │   └── theme/
│   ├── features/
│   │   ├── agent/
│   │   │   ├── screens/
│   │   │   │   ├── agent_dashboard_screen.dart
│   │   │   │   ├── agent_history_screen.dart
│   │   │   │   ├── agent_profile_screen.dart
│   │   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   └── state/
│   │   └── customer/
│   │       ├── screens/
│   │       └── state/
│   ├── shared/
│   └── main.dart
├── test/
├── analysis_options.yaml
└── pubspec.yaml
```

---

## 4. Domain Model Definitions

| Entity                 | Description               | Key Attributes                                                            |
| :--------------------- | :------------------------ | :------------------------------------------------------------------------ |
| **User**               | Central actor profile     | `role`, `email`, `phone`, `status`, `passwordHash`                        |
| **ServiceRequest**     | Customer's requirement    | `category`, `details` (JSONB), `locationZone` (JSONB), `status`           |
| **Transaction**        | Assignment instance       | `requestId`, `agentId`, `status`, `isCustomerUnlocked`, `isAgentUnlocked` |
| **AgentZone**          | Geographic eligibility    | `agentId`, `kifleKetema`, `woreda`                                        |
| **ReferralLink**       | Agent subscription tier   | `referrerId`, `code`, `tier` (Free, Peace, Love, Unity, Abundant Life)    |
| **Feedback**           | Post-delivery report      | `transactionId`, `authorId`, `rating`, `content`                          |
| **FeedbackBundle**     | Mediation container       | `transactionId`, `state`, `stateHistory` (Audit trail)                    |
| **ResolutionProposal** | Admin's suggested outcome | `bundleId`, `proposedText`, `proposedById`                                |
| **AuditLog**           | Immutable system record   | `entityType`, `entityId`, `actorId`, `action`, `metadata`                 |

---

## 5. Business Logic Boundaries

### The "Double-Blind" Request Engine

1. **Intake**: Customer submits request; PII is hidden from the general pool.
2. **Assignment**: Operator selects an **eligible** agent based on `locationZone` and Tier.
3. **Acceptance**: Agent accepts; System "unlocks" Customer PII for the Agent and Agent PII for the Customer.
4. **Fulfillment**: Agent submits `completionProof`; Operator marks "Physically Completed".

### The Mediation Workflow

- Operators **cannot edit** feedback.
- Feedback from both parties is **Sealed** until both submit or a 14-day timeout expires.
- **Bundling**: System automatically bundles concurrent feedback for Admin review.
- **Escalation**: High-risk transactions (defined by budget or keyword) force a Super Admin review toggle.

---

## 6. Data Flow & Control Flow

### Request Lifecycle

`UI (React/Flutter) -> RequestsController -> RequestsService -> Prisma (DB) -> EventEmitter (Notification)`

### Mediation Lifecycle

`MediationService.submitFeedback -> BullMQ (Timeout) -> checkAndBundle -> ResolutionProposal -> FinalResolution`

---

## 7. API Contracts (Internal)

- **Auth**: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`.
- **Requests**: `POST /requests` (Customer), `GET /requests/operator-queue` (Operator), `PATCH /requests/:id/assign` (Operator).
- **Mediation**: `POST /mediation/feedback`, `POST /mediation/propose-resolution`.
- **Security**: All endpoints (except root/health) require JWT. Role-guards enforce Actor hierarchy.

---

## 8. State Management Strategy

- **Backend**: In-memory event bus (`EventEmitter2`) for side effects; BullMQ for persistent task persistence.
- **Web**: `AuthContext` manages persistent session and role-specific redirection. `ModalContext` provides a global imperative UI for alerts/confirmations.
- **Mobile**: `StateNotifierProvider` (Riverpod) for complex entity management (e.g., `authProvider`).

---

## 9. External Integrations

- **BullMQ/Redis**: Critical for the 14-day mediation timeout logic.
- **Prisma/PostgreSQL**: Primary persistence layer.
- **Planned**: Chapa/Telebirr for Subscription and Wallet Payouts.

---

## 10. Configuration & Environments

- **`.env` Requirements**: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_HOST`, `REDIS_PORT`.
- **Environments**: Standard `development`, `production` (enforces HTTPS/Secure Cookies).

---

## 11. Cross-Cutting Concerns

- **Audit Logging**: Every state change in `ServiceRequest` and `FeedbackBundle` is logged via `AuditLog` with actor metadata.
- **Error Handling**: Standardized NestJS `HttpException` hierarchy; UI displays custom toast/modal alerts.
- **Security**: httpOnly cookies for refresh tokens; local storage for access tokens (limited validity).

---

## 12. Missing Implementations (Gap Analysis)

> [!IMPORTANT]
> The following features are defined in the PRD but **absent** or **stubs** in the current code:

1.  **Profiles Agent / Wallet**:
    - Missing `profiles_agent` table and `wallet_balance` logic.
    - No implementation of commission calculation or referral payouts in services.
2.  **Payment Gateways**:
    - No Chapa/Telebirr integration code (stubs only).
3.  **Tier-Based Zoning Restrictions**:
    - While `AgentZone` exists, the logic restricting the _number_ of zones (e.g., Peace = 2 zones) is not enforced in the current `UsersService`.
4.  **Payout UI/Logic**:
    - Frontend routes for payout settings are `null` (Flutter) or placeholders (Web).
5.  **Risk Threshold Logic**:
    - Logic to automatically toggle Super Admin escalation based on transaction value is not yet implemented in the `MediationService`.

---

## 13. Developer Intent & Design Decisions

- **Neutral Mediation**: Operators are intentionally restricted from modifying feedback to prevent corruption ("dalala" market legacy).
- **Redaction Logic**: Mandatory PII masking until explicit mutual acceptance preserves lead privacy and platform value.
- **Authority Hierarchy**: Super Admin is an **Appellate** role, not an operational one, to ensure platform scalability.

---

## 14. Execution Map: Request Fulfillment

1. **Intake**: `pages/RequestIntake.tsx` -> `RequestsService.createRequest`.
2. **Review**: `pages/OperatorDashboard.tsx` uses `getOperatorQueue`.
3. **Dispatch**: Operator selects Agent -> `RequestsService.assignAgent` (Atomic transaction).
4. **Fulfillment**: Agent uploads proof -> `TransactionsService.complete`.
5. **Resolution**: `MediationService.submitFeedback` -> Auto-bundle -> Admin Finalization.
