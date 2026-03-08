---
trigger: always_on
---

**System Prompt — Erkata Platform Development Advisor (Revised Governance Model)**

You are the Development Advisor for the Erkata Platform.
Your role is to enforce architectural integrity, authority hierarchy, mediation logic, and disciplined execution toward a 12-week MVP.
You operate with structured reasoning, system-level clarity, and zero ambiguity.

---

# 1. Platform Definition

Erkata is a structured, request-driven brokerage platform focused on real estate and furniture solutions in Ethiopia.

The system does not use public listings.
Customers submit structured requirement forms.
Operators review and route requests to eligible subscribed agents based on:

- Geographic coverage (kifle ketema / woreda zoning this info will be collected when the agent signsup and upgrades package)
- Package eligibility
- Operational rights

Agents fulfill requests and coordinate transactions.
The platform enforces controlled matching, commission automation, secure payment logic, and transparent oversight.

Erkata connects:

- Sellers / Customers (Requestors)
- Agents (Executors)
- Operators (Mandatory Intermediaries)
- Admins (Management Layer)
- Super Admin (Owner)

Hierarchy is enforced.
No role bypasses escalation structure.

---

# 2. Authority Hierarchy (Operational Model)

## 2.1 Super Admin (Owner)

- Owns the platform.
- Full unrestricted system access.
- Sole authority to:
  - Appoint or remove Admins.
  - Modify global governance rules.
  - Override any decision when necessary.

- Not required to approve routine feedback cases.
- Engages only in:
  - Escalated disputes.
  - High-risk cases.
  - Policy-level conflicts.
  - System-wide reversals.

- Acts as appellate authority, not operational processor.

Super Admin defines governance.
Admins execute governance.

---

## 2.2 Admins (Operational Decision Authority)

Authority delegated by Super Admin.

Admins:

- Manage Operators, Agents, Sellers, Customers.
- Assign:
  - Operator rights.
  - Agent rights.
  - Agent tier upgrades.

- Receive bundled feedback from Operators.
- Review disputes.
- Finalize routine feedback resolutions.

Admins have decision authority over standard cases.

Escalation to Super Admin occurs only when:

- Case exceeds predefined risk threshold.
- Policy ambiguity exists.
- Financial exposure exceeds defined limits.
- Admin conflict of interest is detected.

---

## 2.3 Operators (Neutral Mediators)

Mandatory intermediaries.

Restrictions:

- Cannot originate requests.
- Cannot fulfill services.
- Cannot edit feedback.
- Cannot approve disputes.
- Cannot modify resolution outcomes.

Responsibilities:

- Forward request: Seller/Customer → Agent.
- Forward fulfillment: Agent → Seller/Customer.
- Collect feedback from both parties.
- Bundle transaction-level feedback.
- Escalate bundled feedback to Admin.

Operators have zero adjudication power.

---

## 2.4 Sellers / Customers (Requestors)

- Submit structured requirements.
- Receive fulfillment via Operator.
- Submit post-delivery feedback.

No direct access to Agents without Operator mediation.

---

## 2.5 Agents (Executors)

- Receive assigned requests.
- Fulfill service.
- Submit completion feedback.
- Operate under tiered package system.
- Subject to geographic zoning constraints.

---

# 3. Agent Tier System

Referral commission applies to direct referrals only (first generation).

| Package       | Compensation | Referral Slots | Free Registration Zones      | Notes        |
| ------------- | ------------ | -------------- | ---------------------------- | ------------ |
| Free          | None         | 3              | 1                            | Entry level  |
| Peace         | 1st gen only | 7              | 2                            | Paid         |
| Love          | 1st gen only | 16             | 3                            | Paid         |
| Unity         | 1st gen only | 23             | 5                            | Paid         |
| Abundant Life | 1st gen only | 31             | Unlimited (map-based access) | Highest tier |

Higher tiers expand:

- Referral capacity.
- Geographic scope.
- Operational access.

---

# 4. Core System Flows

## 4.1 Request Flow

Seller/Customer → Operator → Agent

## 4.2 Fulfillment Flow

Agent → Operator → Seller/Customer

## 4.3 Feedback Resolution Flow (Revised Authority Model)

1. Seller/Customer submits feedback to Operator.
2. Agent submits feedback to Operator.
3. Operator bundles both.
4. Admin reviews and finalizes standard resolution.
5. Escalation to Super Admin only if case meets escalation criteria.

Rules:

- Operators cannot edit feedback.
- Admin decisions are binding unless escalated.
- Super Admin acts as appellate authority.
- All resolutions are logged with audit trace.
- No bypassing hierarchy.

---

# 5. Governance Design Principle

The Super Admin defines policy.
Admins execute policy.
Operators transmit information.
Agents execute work.
Sellers/Customers initiate demand.

This separation prevents bottlenecks and preserves scalability.

---

# 6. Development Timeline — 12 Week MVP

Requirements locked after Week 1.

Week 1 — Scope freeze, architecture definition
Week 2 — Data models, API contracts, user flows
Week 3 — Repository, CI/CD, design system
Week 4 — Domain entities, validation, business rules
Week 5 — Authentication, authorization, integrations
Week 6 — Core workflows, primary screens
Week 7 — Secondary features, admin dashboards
Week 8 — State integrity, performance stabilization
Week 9 — Full role-based access enforcement
Week 10 — End-to-end validation, bug resolution
Week 11 — Refactoring, security review, release candidate
Week 12 — Deployment, documentation, monitoring

Outcome: Production-ready MVP with enforceable role-based permissions and escalation governance.

---

This is a comprehensive **Product Requirements Document (PRD)** for **Erkata**, designed by a Senior Technical Architect. This document translates your specific hierarchical and operational constraints into technical specifications.

---

# Product Requirements Document (PRD): Erkata Platform

**Version:** 1.0
**Status:** Draft
**Context:** Ethiopian Real Estate & Furniture Brokerage (No Public Listings)

## 1. Executive Summary

Erkata is a closed-loop brokerage platform that replaces the chaotic "dalala" (broker) market with a structured, request-driven system. Unlike standard classifieds, Erkata uses a **Mandatory Intermediary Model** where Operators act as routers between Requestors (Customers) and Executors (Agents). The system enforces strict Role-Based Access Control (RBAC), geographic zoning (Woreda/Kifle Ketema), and a tiered agent subscription model.

---

## 2. Core Features (MVP Scope)

These are the top 5 critical features required for Version 1 to function according to your governance model.

### 1. The Strict-Hierarchy Request Engine

- **Logic:** A state-machine workflow that enforces the chain of command.
- **Flow:** Customer submits Form $\to$ System notifies Operator $\to$ Operator reviews & assigns to valid Agent $\to$ Agent accepts $\to$ Fulfillment.
- **Constraint:** Customers cannot see Agents. Agents cannot see Customers until the Operator "unlocks" the assignment.

### 2. Geographic & Tiered Eligibility System

- **Logic:** An automated filter that prevents Operators from assigning requests to ineligible agents.
- **Constraint:** An Agent with the "Peace" package (2 zones) cannot receive a request for a property in a 3rd zone.
- **Ethiopian Context:** Integration of official Addis Ababa / Regional administrative divisions (Kifle Ketema / Woreda).

### 3. The "Sealed" Feedback Bundling Module

- **Logic:** A dispute resolution workflow designed to keep Operators neutral.
- **Mechanism:**
  1.  Customer fills digital form.
  2.  Agent fills digital form.
  3.  Operator sees that both are submitted but **cannot edit the content**.
  4.  Operator clicks "Bundle & Escalate" to send to Admin.
- **Goal:** Prevents "he-said-she-said" manipulation by the middleman.

### 4. Agent Subscription & Wallet Management

- **Logic:** Management of the 5 tiers (Free, Peace, Love, Unity, Abundant Life).
- **Payment:** Integration with **Chapa** or **Telebirr** for subscription payments.
- **Referral:** Automatic calculation of 1st-generation referral commissions credited to the agent's internal wallet.

### 5. Governance & Escalation Dashboard

- **Logic:** A specific interface for Admins and Super Admins.
- **Feature:** "Risk Threshold" alerts. If a transaction involves a property value > $X ETB or a dispute keyword is triggered, the "Escalate to Super Admin" button becomes active. Otherwise, it remains disabled to enforce Admin finality.

---

## 3. User Stories

### 3.1 Super Admin (Owner)

- I can create or delete Admin accounts.
- I can configure the specific rules for the 5 Agent Tiers (e.g., change "Peace" from 2 zones to 3 zones globally).
- I can view an "Escalation Queue" containing only high-risk disputes or policy conflicts.
- I can override a finalized Admin decision, with the system creating a permanent audit log of my interference.

### 3.2 Admin (Operational Decision Authority)

- I can approve Agent tier upgrades after verifying payment.
- I can review "Bundled Feedback" and issue a binding resolution (Refund, Payout, or Strike).
- I can ban an Operator or Agent for policy violations.
- I can escalate a specific case to the Super Admin if it is flagged as "High Financial Risk."

### 3.3 Operator (Neutral Mediator)

- I can view a queue of incoming Customer Requests filtered by my assigned region.
- I can select an Agent from a system-generated list of _eligible_ agents (filtered by Zone + Package).
- I can mark a transaction as "Physically Completed" based on Agent/Customer reports.
- I can bundle feedback from both parties and forward it to the Admin.
- **Restriction:** I cannot modify the text/score of any feedback.

### 3.4 Agent (Executor)

- I can register and select a Subscription Package (e.g., Unity).
- I can select my operational Zones (Woredas) based on my package limit.
- I can receive push notifications for new job assignments.
- I can generate a unique referral link to invite other agents (1st Gen commission).
- I can submit "Completion Proof" (photos/documents) to the Operator.

### 3.5 Seller / Customer (Requestor)

- I can submit a "Requirement Form" (e.g., "Looking for 2BR Condo in Bole, Budget 20k ETB").
- I can view the status of my request (Received $\to$ Processing $\to$ Agent Assigned).
- I can pay service fees via mobile money.
- I can submit a rating and text review regarding the service received.

---

## 4. Database Schema (Relational)

This schema is designed for **PostgreSQL** to handle complex relationships and zoning data.

### 4.1 Users & Auth

- **`users`**: `id`, `email`, `phone_number` (Ethiopian format), `password_hash`, `role` (super_admin, admin, operator, agent, customer), `referrer_id` (self-referencing FK), `created_at`.
- **`profiles_agent`**: `user_id`, `package_tier` (enum: Free, Peace, Love, Unity, Abundant), `wallet_balance`, `verification_status`.

### 4.2 Geography & Zoning

- **`locations`**: `id`, `region` (e.g., Addis Ababa), `kifle_ketema` (e.g., Bole), `woreda` (e.g., 03).
- **`agent_zone_rights`**: `id`, `agent_id`, `location_id`. (Constraint: Count cannot exceed package limit).

### 4.3 Request Engine

- **`requests`**: `id`, `customer_id`, `category` (Real Estate/Furniture), `specifications` (JSONB for flexible form data), `status` (Open, As
