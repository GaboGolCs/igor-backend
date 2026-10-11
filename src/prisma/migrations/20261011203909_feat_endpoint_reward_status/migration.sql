/*
  Warnings:

  - The primary key for the `reward_claims` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `reward_title` on the `reward_claims` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - The `status` column on the `reward_claims` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `reward_claims` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `child_id` on the `reward_claims` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `family_id` on the `reward_claims` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "reward_claims" DROP CONSTRAINT "reward_claims_pkey",
ADD COLUMN     "updated_at" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "child_id",
ADD COLUMN     "child_id" UUID NOT NULL,
DROP COLUMN "family_id",
ADD COLUMN     "family_id" UUID NOT NULL,
ALTER COLUMN "reward_title" SET DATA TYPE VARCHAR(200),
DROP COLUMN "status",
ADD COLUMN     "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
