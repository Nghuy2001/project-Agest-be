-- CreateTable
CREATE TABLE "accounts_user" (
    "user_id" TEXT NOT NULL,
    "user_full_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_avatar" TEXT,
    "user_phone" TEXT,
    "user_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_user_user_email_key" ON "accounts_user"("user_email");
