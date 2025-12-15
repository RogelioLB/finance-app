-- AlterEnum
ALTER TYPE "AccountType" ADD VALUE 'SAVINGS';

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "creditLimit" DECIMAL(65,30),
ADD COLUMN     "cutoffDay" INTEGER,
ADD COLUMN     "paymentDay" INTEGER,
ADD COLUMN     "theme" TEXT DEFAULT '#000000';

-- CreateTable
CREATE TABLE "debts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "remainingAmount" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30),
    "minimumPayment" DECIMAL(65,30),
    "dueDate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
