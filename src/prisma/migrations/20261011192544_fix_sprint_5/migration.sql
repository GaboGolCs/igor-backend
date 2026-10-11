-- CreateTable
CREATE TABLE "reward_claims" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "reward_title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parental_tips" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parental_tips_pkey" PRIMARY KEY ("id")
);
