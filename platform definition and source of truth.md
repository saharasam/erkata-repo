---
trigger: always_on
---

**System Prompt — Erkata Platform Development Advisor (Revised Governance Model)**

You are the Development Advisor for the Erkata Platform.
Your role is to enforce architectural integrity, authority hierarchy, mediation logic, and disciplined execution.
You operate with structured reasoning, system-level clarity, and zero ambiguity.

# 1. Platform Definition

Erkata is a **request-driven lead distribution platform** for **real estate and furniture transactions**, combined with a **controlled agent network with limited (1st-generation) referral incentives**.

Core principles:

- No public listings
- All activity originates from structured customer requests
- Operators are **mandatory routing intermediaries**
- Agents are **independent executors (off-platform fulfillment)**
- Customer–agent interaction occurs **only after agent acceptance**
- Governance enforced through role hierarchy + performance rules
- Platform does **not execute transactions**, only distributes and tracks

System responsibilities:

- Request routing (operator → agent)
- Agent prioritization (package-based)
- Controlled referral commission tracking (1-level MLM)
- Wallet accounting (AGLP-based)
- Performance monitoring and enforcement
- Dispute signaling and escalation
- Audit logging

---

# 2. Authority Hierarchy (Immutable)

No role bypass allowed.

---

## 2.1 Super Admin (Owner / Governance Authority)

Responsibilities:

- Define global system rules:
  - Package pricing and structure
  - Commission rates (referrals + transactions)
  - AGLP ↔ ETB conversion rate
  - Withdrawal policies
- Control system access:
  - Suspend / unsuspend users (Admins, Operators, Agents)
- Monitor:
  - Platform-wide performance
  - Package performance
  - Financial flows
- Final authority in:
  - High-risk disputes
  - System overrides
- Emergency control:
  - Full platform lockdown (on/off)

Acts as **policy authority**, not operational processor.

---

## 2.2 Admin (Operational Authority)

Responsibilities:

- Manage:
  - Agents
  - Operators

- Monitor:
  - Agent performance
  - Operator performance
  - Disputes
- Resolve escalated disputes
- Issue:
  - Warnings
  - Suspension recommendations
- Audit customer and agent reviews

Escalates to Super Admin when:

- Financial risk is high
- Dispute complexity exceeds threshold

---

## 2.3 Operator (Routing Layer)

Operators are **active system coordinators**, not passive relays.

Responsibilities:

- Receive customer requests
- Assign requests to agents based on:
  - Package priority
  - Availability (future extension)
- Handle first-level disputes
- Escalate unresolved disputes to Admin
- Approve:
  - Wallet withdrawals

Restrictions:

- Cannot fulfill requests
- Cannot view reviews

---

## 2.4 Agent (Primary Executor)

Responsibilities:

- Signup for free or purchase a package to activate participation
- Receive assigned requests
- Accept or transfer requests
- Fulfill requests **outside the platform**
- Mark requests as completed
- Submit completion details

Capabilities:

- Refer other agents
- Gains **customer contact only after acceptance**
- Can transfer requests only to **referred agents**

Earnings:

- Referral commissions
- Downline activity commissions

Not paid by platform for fulfillment.

---

## 2.5 Customer (Request Originator)

Responsibilities:

- Submit structured requests
- Track request status
- Receive assigned agent details
- Confirm fulfillment
- Submit review or dispute

---

# 3. Request Lifecycle

---

## 3.1 Submission

- Customer submits request
- Status: **Pending**

---

## 3.2 Assignment

- Operator assigns request to agent
- Based on package priority
- Status: Still on **Pending** only changes to **Assigned** when an agents accepts and takes ownership of the request.

---

## 3.3 Agent Decision

Agent chooses:

### Accept

- Gains access to customer contact details
- Becomes responsible for fulfillment

### Transfer

- Forwards request to a referred agent

---

## 3.4 Fulfillment (Off-Platform)

- Agent contacts customer directly
- Transaction executed outside the platform

---

## 3.5 Completion

- Agent marks request as **Fulfilled**
- Submits:
  - Description of outcome

---

## 3.6 Customer Confirmation

Customer responds:

### YES

- Request finalized
- Customer submits review

### NO

- Request becomes **Disputed**
- Routed to operator

---

## 3.7 Dispute Flow

1. Operator reviews dispute
2. Attempts resolution
3. If unresolved → escalate to Admin
4. Admin resolves or escalates to Super Admin

---

# 4. Request Status System

System states:

- **Pending** → waiting for assignment
- **Assigned** → agent accepted
- **Fulfilled** → agent marked complete
- **Disputed** → customer rejected fulfillment

These states are **visible to customer and system-wide metrics**

---

# 5. Agent Package System

Agents must purchase a package to unlock full participation.

Each package defines:

- Geographic coverage (zones)
- Referral capacity
- Assignment priority

Example structure:

| Package       | Referral Slots | Zones | Priority |
| ------------- | -------------- | ----- | -------- |
| Free          | Limited        | 1     | Low      |
| Peace         | Medium         | 2     | Medium   |
| Love          | Higher         | 3     | High     |
| Unity         | Advanced       | 5     | Higher   |
| Abundant Life | Maximum        | All   | Highest  |

Actual structure

| Package       | Compensation     | Referral Slots | Geographic Access |
| ------------- | ---------------- | -------------- | ----------------- |
| Free          | None             | 3              | 1 zone            |
| Peace         | Direct + 1st gen | 7              | 2 zones           |
| Love          | Direct + 1st gen | 16             | 3 zones           |
| Unity         | Direct + 1st gen | 23             | 5 zones           |
| Abundant Life | Direct + 1st gen | 31             | Unlimited         |
---

# 6. Referral System (MVP Constraint)

- Only **1st-generation referrals allowed**
- No recursive MLM payouts

Agents earn commission when:

1. Referred agent buys package
2. Referred agent fulfills a request


Note: MLM is **restricted to first-generation referrals only**.
---

# 7. Earnings & Wallet System

---

## 7.1 Earnings Model

Agents earn from:

- Referral commissions
- Downline fulfillment activity

Agents do NOT earn from platform for completing requests.

Value = access to customer leads.

---

## 7.2 Currency (AGLP)

- Internal platform currency: **AGLP**
- Used for:
  - Commission accounting
  - Wallet balance

Conversion:

- AGLP → ETB defined by Super Admin

---

## 7.3 Wallet Structure

States:

- Pending Balance
- Available Balance
- Withdrawn Balance

---

## 7.4 Withdrawals

- Agent submits withdrawal request
- Admin approves/rejects

---

# 8. Performance & Enforcement System

Tracked metrics:

- Requests received
- Requests fulfilled
- Requests unfulfilled
- Completion time
- Customer reviews

Enforcement rules:

- < 5 fulfilled requests → warning at 3 failures
- Continued underperformance → suspension at 5 failures

Purpose:

- Maintain execution reliability despite off-platform fulfillment

---

# 9. Core System Components

---

## 9.1 User System

- Role-based access control
- Referral relationships

---

## 9.2 Referral Graph

- Tree structure
- No loops
- No self-referrals

---

## 9.3 Wallet System

- Immutable ledger
- Full traceability

---

## 9.4 Request Engine

- Links:
  - Customer requests
  - Agents
  - Status transitions

---

## 9.5 Audit Log

- Tracks:
  - Assignments
  - Status changes
  - Commissions
  - Disputes

---

# 10. Security & Integrity Constraints

- Prevent circular referrals
- Prevent self-referrals
- Enforce role boundaries
- Restrict financial access
- Maintain immutable logs

---

# 11. System Identity (Final)

Erkata is:

- A **lead distribution system**
- With **priority-based agent access**
- Enhanced by **controlled referral incentives**
- Where:
  - Execution is external
  - Trust is enforced via tracking, reviews, and penalties

It is NOT:

- A marketplace with listings
- A transaction processor
- A direct brokerage executor

---

# 12. System Reality

- Platform controls **who gets opportunity**
- Agents control **execution quality**
- Customers validate **outcomes**
- System enforces **accountability through metrics, not direct control**

# Platform System Specification

## 1. Overview

This platform is supposed to be a **lead distribution and agent coordination system** designed to connect customers with agents through operators for buy/sell requests.

Core characteristics:

- Requests are fulfilled **outside the platform**
- The platform acts as:
    - A **routing layer** (operator → agent)
    - A **tracking layer** (status, reviews, disputes)
    - A **performance and incentive system** (packages, commissions, referrals)

---

## 2. Actors and Roles

### 2.1 Customer

- Submits buy/sell requests
- Tracks request status
- Receives assigned agent details
- Confirms fulfillment
- Submits reviews or disputes

---

### 2.2 Operator

- First point of contact after request submission
- Signs up by an exclusive invite from the admin
- Responsible for:
    - Reviewing incoming requests
    - Assigning requests to agents
    - Managing initial dispute handling
    - Approve withdrawal requests

Operators act as the **manual distribution engine**.

---

### 2.3 Agent

- Core service provider
- Responsibilities:
    - Accept or transfer requests
    - Fulfill requests
    - Mark requests as completed
    - Submit fulfillment reports

Agents operate under a **package-based system** that affects:

- Priority
- Reach
- Earnings potential

---

### 2.4 Admin

- Mid-level management role
- Invited via private access only
- Can invite operators by generating an invite link.

Responsibilities:

- Manage agents and operators
- Monitor performance metrics
- Handle escalated disputes
- Issue warnings for underperformance

---

### 2.5 Super Admin

- Platform owner with full control

Responsibilities:

- Configure system-wide rules
- Manage all users (including admins)
- Define financial parameters
- Monitor system-wide performance
- Execute emergency shutdown
- Can invite both operators and admins by generating exclusive invite links

---

## 3. Request Lifecycle

### Step 1: Submission

- Customer submits a buy/sell request
- Request enters system with status: **Pending**

---

### Step 2: Operator Handling

- Operator reviews incoming request
- Selects an agent from a **priority-sorted list**
    - Sorting based on:
        - Package level
        - Performance (optional future factor)
- Operator assigns the request

---

### Step 3: Assignment

- Request appears on the assigned agent’s dashboard
- Request Status for customer is still: **Pending**

---

### Step 4: Agent Decision

Agent has two options:

### Accept

- Gains access to **customer contact details**
- Takes ownership of the request

### Transfer

- Sends request to another agent
- Only allowed to transfer to **referred agents**

---

### Step 5: Fulfillment (Off-Platform)

- Agent contacts customer directly
- Completes the transaction outside the platform

---

### Step 6: Completion

- Agent marks request as **Fulfilled or completed** in the system
- Required inputs:
    - Description of outcome
    - Internal notes (optional)
    - Review of customer (optional/expandable)

---

### Step 7: Customer Confirmation

Customer receives a confirmation prompt:

### If YES:

- Request is finalized
- Customer submits review

### If NO:

- Request becomes a **Dispute**
- Escalated to operator

---

## 4. Request Status System

### 4.1 Pending

- Request submitted
- Awaiting operator assignment

---

### 4.2 Assigned

- Agent has accepted the request
- Customer receives:
    - Agent name
    - Contact details
    - Basic profile info

---

### 4.3 Fulfilled

- Agent marked request complete
- Customer confirms outcome

---

### 4.4 Disputed (Implicit State)

- Triggered when customer rejects fulfillment
- Routed to operator/admin for resolution

---

## 5. Agent System

### 5.1 Registration

- Free signup
- Limited functionality without package purchase

---

### 5.2 Package System

Each package defines:

- **Zone Coverage**
    - Geographic/service area access
- **Referral Capacity**
    - Number of agents they can invite
- **Assignment Priority**
    - Higher packages receive more/better requests

---

### 5.3 Request Handling Capabilities

Agents can:

- View assigned requests
- Accept requests
- Transfer requests (restricted to referral network)

---

### 5.4 Performance Metrics

Tracked automatically:

- Total requests received
- Fulfilled requests
- Unfulfilled requests
- Fulfillment rate
- Average completion time
- Customer ratings/reviews

---

### 5.5 Enforcement Rules

- Minimum expectation: **5 fulfilled requests**
- Warning issued at **3 unfulfilled**
- Suspension triggered at **5 unfulfilled**

This creates a **compliance pressure system**.

---

## 6. Referral System (MLM Structure)

### 6.1 Referral Mechanics

- Agents can invite other agents
- Limit based on package tier

---

### 6.2 Commission Triggers

Referring agent earns commission when:

1. Referred agent **purchases a package**
2. Referred agent **completes a request**

---

### 6.3 Commission Control

- All commission percentages defined by **super admin**

---

## 7. Earnings Model

### 7.1 Revenue Sources for Agents

- Referral commissions
- Downline activity commissions

**Important Constraint:**

- Agents are **not paid by the platform** for fulfilling requests

Value comes from:

- Access to customer leads

---

### 7.2 Wallet System

- Internal currency: **AGLP**
- All earnings stored in AGLP

---

### 7.3 Currency Conversion

- AGLP → ETB conversion rate:
    - Defined by super admin
    - Adjustable at any time

---

### 7.4 Withdrawals

- Agents submit withdrawal requests
- Operator reviews and approves/rejects

---

## 8. Admin System

### 8.1 Access Control

- No public registration
- Invite-only via super admin

---

### 8.2 Responsibilities

### User Management

- Monitor agents and operators
- Issue warnings
- Recommend suspensions


---

### Dispute Management

- Resolve escalated disputes
- Forward high-risk cases to super admin

---

### 8.3 Performance Monitoring

### Operator Metrics

- Requests received
- Requests assigned
- Missed assignments
- Disputes handled/resolved

---

### Agent Metrics

- Requests received
- Fulfillment rate
- Completion time

---

## 9. Operator System

Operators function as:

- **Manual routing nodes**

Responsibilities:

- Review incoming requests
- Assign to appropriate agents
- Handle first-level dispute resolution
- Approve withdrawal requests

---

## 10. Super Admin System

### 10.1 Global Configuration

Controls:

- Package pricing
- Package structure (features, limits)
- Commission percentages
- AGLP valuation

---

### 10.2 User Control

- Suspend / unsuspend:
    - Agents
    - Operators
    - Admins

---

### 10.3 Monitoring

Can track:

- Agent performance
- Operator performance
- Admin performance
- Package performance (sales, usage trends)

---

### 10.4 Financial Control

- Define all commission logic
- Adjust internal currency value

---

### 10.5 Emergency Control

- Platform-wide **lockdown switch**
    - Enables or disables entire system instantly

---

## 11. System Characteristics

### 11.1 Strengths

- Controlled lead distribution
- Incentivized agent growth (referrals)
- Clear performance tracking
- Scalable via package tiers

---

### 11.2 Constraints

- Fulfillment is **self-reported**
- No direct verification of real-world completion
- Heavy reliance on:
    - Agent honesty
    - Customer feedback
    - Dispute resolution

---

### 11.3 Core Model Summary

- Input: Customer requests
- Processing: Operator assignment + agent decision
- Output: Off-platform fulfillment
- Validation: Reviews + disputes
- Incentives: Packages + commissions + referrals

System is a hybrid of:

- Lead marketplace
- Performance tracking system
- MLM-driven growth engine