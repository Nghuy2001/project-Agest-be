-- CreateEnum
CREATE TYPE "CVStatus" AS ENUM ('pending', 'viewed', 'contacted', 'rejected');

-- AlterTable
ALTER TABLE "accounts_company" ADD COLUMN     "company_search" TEXT;

-- CreateTable
CREATE TABLE "cvs" (
    "cv_id" TEXT NOT NULL,
    "cv_job_id" TEXT NOT NULL,
    "cv_user_id" TEXT NOT NULL,
    "cv_full_name" TEXT NOT NULL,
    "cv_email" TEXT NOT NULL,
    "cv_phone" TEXT,
    "cv_file" TEXT NOT NULL,
    "cv_viewed" BOOLEAN NOT NULL DEFAULT false,
    "cv_status" "CVStatus" NOT NULL DEFAULT 'pending',
    "cv_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cv_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("cv_id")
);

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_cv_job_id_fkey" FOREIGN KEY ("cv_job_id") REFERENCES "jobs"("job_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_cv_user_id_fkey" FOREIGN KEY ("cv_user_id") REFERENCES "accounts_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
