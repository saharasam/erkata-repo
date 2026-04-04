-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'delivered';

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "is_online" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_assignment_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "assigned_operator_id" UUID,
ADD COLUMN     "assignment_pushed_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_assigned_operator_id_fkey" FOREIGN KEY ("assigned_operator_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
