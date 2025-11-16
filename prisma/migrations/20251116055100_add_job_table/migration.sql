-- CreateTable
CREATE TABLE "jobs" (
    "job_id" TEXT NOT NULL,
    "job_company_id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "job_salary_min" INTEGER NOT NULL,
    "job_salary_max" INTEGER NOT NULL,
    "job_position" TEXT NOT NULL,
    "job_working_form" TEXT NOT NULL,
    "job_technologies" TEXT[],
    "job_description" TEXT NOT NULL,
    "job_images" TEXT[],
    "job_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "job_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("job_id")
);

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_job_company_id_fkey" FOREIGN KEY ("job_company_id") REFERENCES "accounts_company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
