/*
  Warnings:

  - The values [pending,viewed,contacted] on the enum `CVStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CVStatus_new" AS ENUM ('initial', 'approved', 'rejected');
ALTER TABLE "public"."cvs" ALTER COLUMN "cv_status" DROP DEFAULT;
ALTER TABLE "cvs" ALTER COLUMN "cv_status" TYPE "CVStatus_new" USING ("cv_status"::text::"CVStatus_new");
ALTER TYPE "CVStatus" RENAME TO "CVStatus_old";
ALTER TYPE "CVStatus_new" RENAME TO "CVStatus";
DROP TYPE "public"."CVStatus_old";
ALTER TABLE "cvs" ALTER COLUMN "cv_status" SET DEFAULT 'initial';
COMMIT;

-- AlterTable
ALTER TABLE "cvs" ALTER COLUMN "cv_status" SET DEFAULT 'initial';
