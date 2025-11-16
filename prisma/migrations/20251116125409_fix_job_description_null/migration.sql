-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "job_position" DROP NOT NULL,
ALTER COLUMN "job_working_form" DROP NOT NULL,
ALTER COLUMN "job_description" DROP NOT NULL;
