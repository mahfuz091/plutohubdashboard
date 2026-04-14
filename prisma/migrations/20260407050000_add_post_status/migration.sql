CREATE TYPE "public"."PostStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISH', 'DECLINE');

ALTER TABLE "public"."Post"
ADD COLUMN "status" "public"."PostStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "declineNote" TEXT;

UPDATE "public"."Post"
SET "status" = 'PENDING'
WHERE "status" IS NULL;
