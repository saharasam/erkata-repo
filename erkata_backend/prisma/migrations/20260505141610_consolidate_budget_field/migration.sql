/*
  Warnings:

  - The values [matched,in_progress,ESCALATED,delivered,DISPUTED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `aglp_transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `aglp_transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `audit_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `feedbacks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `feedbacks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `assigned_at` on the `matches` table. All the data in the column will be lost.
  - The `status` column on the `matches` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `created_at` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `requires_approval` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `aglp_pending` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `budget_max` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `budget_min` on the `requests` table. All the data in the column will be lost.
  - The `type` column on the `requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `city` on the `zones` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `zones` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transaction_id]` on the table `feedbacks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[match_id]` on the table `resolution_proposals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `zones` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `display_name` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `requests` required. This step will fail if there are existing NULL values in that column.
  - Made the column `woreda` on table `requests` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UpgradeRequestStatus" AS ENUM ('SUBMITTED', 'OPERATOR_VERIFIED', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('pending', 'assigned', 'fulfilled', 'completed', 'disputed', 'cancelled');
ALTER TABLE "requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "requests" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "requests" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'financial_operator';

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_operator_id_fkey";

-- DropIndex
DROP INDEX "invites_token_idx";

-- DropIndex
DROP INDEX "transactions_status_idx";

-- AlterTable
ALTER TABLE "aglp_transactions" DROP CONSTRAINT "aglp_transactions_pkey",
ADD COLUMN     "bank_account_holder" TEXT,
ADD COLUMN     "bank_account_number" TEXT,
ADD COLUMN     "bank_name" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "aglp_transactions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_pkey",
ADD COLUMN     "comment" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id");
-- AlterTable
ALTER TABLE "final_resolutions" ADD COLUMN     "description" TEXT,
ADD COLUMN     "final_decision" TEXT;

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "assigned_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "operator_id" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'assigned';

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "packages" DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "requires_approval",
DROP COLUMN "updated_at",
ADD COLUMN     "display_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "aglp_pending",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "missed_assignments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tin_number" TEXT,
ADD COLUMN     "trade_license_number" TEXT,
ADD COLUMN     "warning_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "is_escalated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'real_estate',
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "woreda" SET NOT NULL;

-- AlterTable
ALTER TABLE "resolution_proposals" ADD COLUMN     "match_id" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "agent_earnings" DECIMAL(12,2),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "platform_fee" DECIMAL(12,2),
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "zones" DROP COLUMN "city",
DROP COLUMN "is_active",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'city';

-- CreateTable
CREATE TABLE "system_broadcasts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT,
    "target" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upgrade_requests" (
    "id" TEXT NOT NULL,
    "agent_id" UUID NOT NULL,
    "current_tier" "Tier" NOT NULL,
    "target_tier" "Tier" NOT NULL,
    "status" "UpgradeRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "proof_url" TEXT,
    "internal_note" TEXT,
    "operator_id" UUID,
    "admin_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upgrade_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aglp_transactions_created_at_profile_id_type_idx" ON "aglp_transactions"("created_at", "profile_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_transaction_id_key" ON "feedbacks"("transaction_id");

-- CreateIndex
CREATE INDEX "matches_agent_id_status_idx" ON "matches"("agent_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "resolution_proposals_match_id_key" ON "resolution_proposals"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "zones_name_key" ON "zones"("name");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_tier_fkey" FOREIGN KEY ("tier") REFERENCES "packages"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_links" ADD CONSTRAINT "referral_links_tier_fkey" FOREIGN KEY ("tier") REFERENCES "packages"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolution_proposals" ADD CONSTRAINT "resolution_proposals_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
