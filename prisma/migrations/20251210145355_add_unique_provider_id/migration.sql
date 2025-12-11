/*
  Warnings:

  - A unique constraint covering the columns `[company_provider_id]` on the table `accounts_company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_provider_id]` on the table `accounts_user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "accounts_company_company_provider_id_key" ON "accounts_company"("company_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_user_user_provider_id_key" ON "accounts_user"("user_provider_id");
