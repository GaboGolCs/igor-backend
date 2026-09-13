-- DropForeignKey
ALTER TABLE "mood_logs" DROP CONSTRAINT "mood_logs_user_id_fkey";

-- AlterTable
ALTER TABLE "mood_logs" ALTER COLUMN "logged_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "mood_logs_user_id_logged_at_idx" ON "mood_logs"("user_id", "logged_at");

-- AddForeignKey
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
