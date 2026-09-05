-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARENT', 'CHILD', 'ADMIN');

-- CreateEnum
CREATE TYPE "Emotion" AS ENUM ('HAPPY', 'SAD', 'ANXIOUS', 'NEUTRAL', 'ANGRY');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('EXAM', 'MEETING', 'MATERIAL', 'FAMILY', 'OTHER');

-- CreateTable
CREATE TABLE "families" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "email" VARCHAR(255),
    "password_hash" VARCHAR(255) NOT NULL,
    "alias" VARCHAR(50) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARENT',
    "avatar_icon" VARCHAR(100) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "emotion" "Emotion" NOT NULL,
    "activity_text" TEXT NOT NULL,
    "need_text" TEXT NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mood_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "category" "Category" NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_reminders" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "targeted_user_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "recurrence_time" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "daily_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trivia_questions" (
    "id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "question_text" TEXT NOT NULL,
    "options_json" JSONB NOT NULL,
    "correct_option" INTEGER NOT NULL,

    CONSTRAINT "trivia_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "families_code_key" ON "families"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_alias_key" ON "users"("alias");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reminders" ADD CONSTRAINT "daily_reminders_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reminders" ADD CONSTRAINT "daily_reminders_targeted_user_id_fkey" FOREIGN KEY ("targeted_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
