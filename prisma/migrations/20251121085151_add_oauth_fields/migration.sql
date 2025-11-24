-- AlterTable
ALTER TABLE "accounts_company" ADD COLUMN     "company_provider" TEXT,
ADD COLUMN     "company_provider_id" TEXT;

-- AlterTable
ALTER TABLE "accounts_user" ADD COLUMN     "user_provider" TEXT,
ADD COLUMN     "user_provider_id" TEXT;
