```mermaid
flowchart TB
    %% STYLING
    classDef frontend fill:#e0f2fe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef controller fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87
    classDef service fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef database fill:#fef9c3,stroke:#d97706,stroke-width:2px,color:#78350f,shape:cylinder
    classDef async fill:#ffedd5,stroke:#ca8a04,stroke-width:2px,color:#713f12
    
    %% FRONTEND LAYER
    subgraph Frontend ["Frontend UI (React / Vite)"]
        direction TB
        UI_Intake["RequestIntakeFlow.tsx\n(Customer)"]:::frontend
        UI_OpDash["OperatorDashboard.tsx\nAgentAssignmentModal.tsx"]:::frontend
        UI_AgentDash["FocusBoard.tsx\nRequestCard.tsx\n(Agent)"]:::frontend
        UI_CustConfirm["FulfillmentConfirmation.tsx\nFeedbackForm.tsx\n(Customer)"]:::frontend
        UI_Mediation["DisputesBoard.tsx (Op)\nEscalatedDisputes.tsx (Admin)\nFinalResolutions.tsx (SA)"]:::frontend
    end

    %% CONTROLLER LAYER (API BOUNDARY)
    subgraph Controllers ["API Controllers (NestJS HTTP Boundary)"]
        direction TB
        C_Req["requests.controller.ts"]:::controller
        C_Tx["transactions.controller.ts"]:::controller
        C_Med["mediation.controller.ts"]:::controller
    end

    %% SERVICE LAYER (BUSINESS LOGIC)
    subgraph Services ["Core Services (NestJS Providers)"]
        direction TB
        S_Req["requests.service.ts"]:::service
        S_Tx["transactions.service.ts"]:::service
        S_Aglp["aglp.service.ts\n(Economy Engine)"]:::service
        S_Med["mediation.service.ts"]:::service
    end

    %% ASYNC / EVENT LAYER
    subgraph AsyncLayer ["Async & Event Bus"]
        direction TB
        E_Bus["request.events.ts\n(EventEmitter2)"]:::async
        WS_Gate["notifications.gateway.ts\n(Socket.io)"]:::async
        Q_Proc["assignment.processor.ts\n(BullMQ)"]:::async
    end

    %% DATA LAYER
    subgraph DataStore ["Data Storage (PostgreSQL & Redis)"]
        direction TB
        DB_Req[("requests\ntable")]:::database
        DB_Match[("matches\ntable")]:::database
        DB_Tx[("transactions &\naglp_transactions")]:::database
        DB_Med[("feedbacks &\nfeedback_bundles")]:::database
        Redis[("Redis\nPresence Keys")]:::database
    end

    %% ----------------------------------------------------
    %% DATA FLOW MAPPING
    %% ----------------------------------------------------

    %% 1. Submission & Auto-Push
    UI_Intake -- "{CreateRequestDto}" --> C_Req
    C_Req -- "createRequest()" --> S_Req
    S_Req -- "INSERT (status: pending)" --> DB_Req
    S_Req -- "READ (Find online Op)" --> Redis
    S_Req -- "UPDATE (assignedOperatorId)" --> DB_Req
    S_Req -- "{requestId, operatorId}" --> Q_Proc
    S_Req -- "Emit 'request.pushed'" --> E_Bus
    E_Bus -- "Send Notification" --> WS_Gate
    WS_Gate -- "WS payload" --> UI_OpDash

    %% 2. Operator Assignment
    UI_OpDash -- "{agentId}" --> C_Req
    C_Req -- "assignAgent()" --> S_Req
    S_Req -- "INSERT (status: assigned)" --> DB_Match
    S_Req -- "Emit 'match.created'" --> E_Bus
    E_Bus -- "Send Notification" --> WS_Gate
    WS_Gate -- "WS payload" --> UI_AgentDash

    %% 3. Agent Acceptance
    UI_AgentDash -- "PATCH /accept" --> C_Tx
    C_Tx -- "acceptAssignment()" --> S_Tx
    S_Tx -- "UPDATE (status: accepted)" --> DB_Match
    S_Tx -- "UPDATE (status: assigned)" --> DB_Req
    S_Tx -- "INSERT (status: pending)" --> DB_Tx
    S_Tx -- "Emit 'match.accepted'" --> E_Bus
    E_Bus -- "Send Notification" --> WS_Gate
    WS_Gate -- "WS payload" --> UI_CustConfirm

    %% 4. Agent Completion & Escrow
    UI_AgentDash -- "PATCH /complete" --> C_Tx
    C_Tx -- "markComplete()" --> S_Tx
    S_Tx -- "UPDATE (status: completed)" --> DB_Match
    S_Tx -- "UPDATE (status: fulfilled)" --> DB_Req
    S_Tx -- "Calculate Commission" --> S_Aglp
    S_Aglp -- "INSERT (type: EARN, status: PENDING)" --> DB_Tx
    S_Tx -- "Emit 'match.completed'" --> E_Bus
    E_Bus -- "Send Notification" --> WS_Gate
    WS_Gate -- "WS payload" --> UI_CustConfirm

    %% 5. Customer Confirmation & Feedback
    UI_CustConfirm -- "{confirmed: boolean}" --> C_Req
    C_Req -- "confirmFulfillment()" --> S_Req
    S_Req -- "UPDATE (status: fulfilled/disputed)" --> DB_Req
    
    UI_CustConfirm -- "{FeedbackData}" --> C_Med
    UI_AgentDash -- "{FeedbackData}" --> C_Med
    C_Med -- "submitFeedback()" --> S_Med
    S_Med -- "INSERT (feedback)" --> DB_Med
    S_Med -- "checkAndBundle() -> UPSERT" --> DB_Med

    %% 6. Escalation & Mediation
    S_Req -. "If Disputed -> Emit 'request.disputed'" .-> E_Bus
    E_Bus -. "Send Alert" .-> WS_Gate
    WS_Gate -. "WS Payload" .-> UI_Mediation

    UI_Mediation -- "PATCH /escalate-dispute\nor /void-dispute" --> C_Req
    C_Req -- "escalateDispute() / voidDispute()" --> S_Req
    S_Req -- "UPDATE metadata (notes)" --> DB_Req

    UI_Mediation -- "POST /propose\nPOST /finalize" --> C_Med
    C_Med -- "finalizeResolution()" --> S_Med
    S_Med -- "INSERT (final_resolutions)" --> DB_Med