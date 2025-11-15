-- CreateTable
CREATE TABLE "cities" (
    "city_id" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("city_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_city_name_key" ON "cities"("city_name");

-- AddForeignKey
ALTER TABLE "accounts_company" ADD CONSTRAINT "accounts_company_company_city_fkey" FOREIGN KEY ("company_city") REFERENCES "cities"("city_id") ON DELETE SET NULL ON UPDATE CASCADE;
