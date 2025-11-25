-- AlterTable
ALTER TABLE "accounts_company" ADD COLUMN     "company_refresh_token" TEXT;

-- AlterTable
ALTER TABLE "accounts_user" ADD COLUMN     "user_refresh_token" TEXT;
