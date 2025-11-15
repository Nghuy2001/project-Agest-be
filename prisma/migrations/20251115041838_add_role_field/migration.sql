-- CreateEnum
CREATE TYPE "Role" AS ENUM ('candidate', 'employer');

-- AlterTable
ALTER TABLE "accounts_company" ADD COLUMN     "company_role" "Role" NOT NULL DEFAULT 'employer';

-- AlterTable
ALTER TABLE "accounts_user" ADD COLUMN     "user_role" "Role" NOT NULL DEFAULT 'candidate';
