CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'AUTHOR');

ALTER TABLE "public"."User"
ADD COLUMN "role" "public"."UserRole" NOT NULL DEFAULT 'AUTHOR',
ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;

UPDATE "public"."User"
SET "role" = 'ADMIN', "approved" = true;
