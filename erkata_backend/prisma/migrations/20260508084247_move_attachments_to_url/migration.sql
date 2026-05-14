/*
  Warnings:

  - You are about to drop the column `content` on the `attachments` table. All the data in the column will be lost.
  - Added the required column `url` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "content",
ADD COLUMN     "url" TEXT NOT NULL;
