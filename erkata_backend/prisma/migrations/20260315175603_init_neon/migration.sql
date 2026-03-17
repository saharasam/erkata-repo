-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'admin', 'operator', 'agent', 'customer');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('real_estate', 'furniture');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'matched', 'in_progress', 'completed', 'cancelled', 'ESCALATED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('assigned', 'accepted', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PEACE', 'LOVE', 'UNITY', 'ABUNDANT_LIFE');

-- CreateEnum
CREATE TYPE "FeedbackBundleState" AS ENUM ('WAITING_BOTH', 'WAITING_AGENT', 'WAITING_CUSTOMER', 'BUNDLED', 'PROPOSED', 'RESOLVED', 'REJECTED', 'TIMED_OUT');

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT DEFAULT 'Addis Ababa',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "zone_id" TEXT,
    "wallet_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "referred_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_zones" (
    "id" TEXT NOT NULL,
    "agent_id" UUID NOT NULL,
    "zone_id" TEXT,
    "kifle_ketema" TEXT NOT NULL,
    "woreda" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_links" (
    "id" TEXT NOT NULL,
    "referrer_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "customer_id" UUID NOT NULL,
    "type" "RequestType" NOT NULL DEFAULT 'real_estate',
    "category" TEXT NOT NULL,
    "description" TEXT,
    "budget_min" DECIMAL(12,2),
    "budget_max" DECIMAL(12,2),
    "zone_id" TEXT NOT NULL,
    "woreda" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "agent_id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'assigned',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "commission_rate" DECIMAL(12,2) NOT NULL DEFAULT 0.05,
    "commission_amount" DECIMAL(12,2),
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "payment_proof_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_bundles" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "state" "FeedbackBundleState" NOT NULL DEFAULT 'WAITING_BOTH',
    "state_history" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolution_proposals" (
    "id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "proposed_by_id" UUID NOT NULL,
    "proposed_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolution_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_resolutions" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "comment" TEXT,
    "finalized_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "final_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "target_table" TEXT,
    "target_id" TEXT,
    "transaction_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agent_zones_agent_id_zone_id_woreda_key" ON "agent_zones"("agent_id", "zone_id", "woreda");

-- CreateIndex
CREATE UNIQUE INDEX "referral_links_referrer_id_key" ON "referral_links"("referrer_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_links_code_key" ON "referral_links"("code");

-- CreateIndex
CREATE INDEX "requests_customer_id_idx" ON "requests"("customer_id");

-- CreateIndex
CREATE INDEX "requests_zone_id_status_idx" ON "requests"("zone_id", "status");

-- CreateIndex
CREATE INDEX "matches_agent_id_status_idx" ON "matches"("agent_id", "status");

-- CreateIndex
CREATE INDEX "matches_request_id_idx" ON "matches"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_request_id_agent_id_key" ON "matches"("request_id", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_match_id_key" ON "transactions"("match_id");

-- CreateIndex
CREATE INDEX "transactions_match_id_idx" ON "transactions"("match_id");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_bundles_transaction_id_key" ON "feedback_bundles"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "final_resolutions_proposal_id_key" ON "final_resolutions"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_token_idx" ON "invites"("token");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_zones" ADD CONSTRAINT "agent_zones_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_zones" ADD CONSTRAINT "agent_zones_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_links" ADD CONSTRAINT "referral_links_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_bundles" ADD CONSTRAINT "feedback_bundles_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolution_proposals" ADD CONSTRAINT "resolution_proposals_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "feedback_bundles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolution_proposals" ADD CONSTRAINT "resolution_proposals_proposed_by_id_fkey" FOREIGN KEY ("proposed_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_resolutions" ADD CONSTRAINT "final_resolutions_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "resolution_proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_resolutions" ADD CONSTRAINT "final_resolutions_finalized_by_id_fkey" FOREIGN KEY ("finalized_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
