-- CreateTable
CREATE TABLE "accounts_company" (
    "company_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_email" TEXT NOT NULL,
    "company_password" TEXT NOT NULL,
    "company_city" TEXT,
    "company_address" TEXT,
    "company_model" TEXT,
    "company_employees" TEXT,
    "company_working_time" TEXT,
    "company_work_overtime" TEXT,
    "company_phone" TEXT,
    "company_description" TEXT,
    "company_logo" TEXT,
    "company_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_company_pkey" PRIMARY KEY ("company_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_company_company_email_key" ON "accounts_company"("company_email");
