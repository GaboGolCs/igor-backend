-- AlterTable
ALTER TABLE "mood_logs" ALTER COLUMN "need_text" DROP NOT NULL;

-- Un niño nunca tiene email y un apoderado siempre tiene uno
-- (Prisma no modela CHECK constraints: se agregan a mano en la migración)
ALTER TABLE "users" ADD CONSTRAINT "users_child_without_email" CHECK ("role" <> 'CHILD' OR "email" IS NULL);
ALTER TABLE "users" ADD CONSTRAINT "users_parent_with_email" CHECK ("role" <> 'PARENT' OR "email" IS NOT NULL);
