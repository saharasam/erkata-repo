/*
  Warnings:

  - You are about to drop the column `wallet_balance` on the `profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referral_code]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AglpTransactionType" AS ENUM ('DEPOSIT', 'SPEND_PACKAGE', 'EARN', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "AglpTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "wallet_balance",
ADD COLUMN     "aglp_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "aglp_pending" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "aglp_withdrawn" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "referral_code" TEXT;

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" "Tier" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "referral_slots" INTEGER NOT NULL,
    "zone_limit" INTEGER NOT NULL,
    "description" TEXT,
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aglp_transactions" (
    "id" TEXT NOT NULL,
    "profile_id" UUID NOT NULL,
    "type" "AglpTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "etb_equivalent" DECIMAL(12,2),
    "conversion_rate" DECIMAL(12,2),
    "status" "AglpTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "reference_id" TEXT,
    "reference_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aglp_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "packages_name_key" ON "packages"("name");

-- CreateIndex
CREATE INDEX "aglp_transactions_profile_id_idx" ON "aglp_transactions"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_referral_code_key" ON "profiles"("referral_code");

-- AddForeignKey
ALTER TABLE "aglp_transactions" ADD CONSTRAINT "aglp_transactions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
