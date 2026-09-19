/*
  Warnings:

  - Added the required column `targeted_user_id` to the `calendar_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `calendar_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `daily_reminders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "calendar_events" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "targeted_user_id" UUID NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "event_date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "daily_reminders" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Santiago';
