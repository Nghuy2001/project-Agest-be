-- AlterTable
ALTER TABLE "accounts_company" ALTER COLUMN "company_password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "accounts_user" ALTER COLUMN "user_password" DROP NOT NULL;
