/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `reservationId` on the `Feedback` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_reservationId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "createdAt",
DROP COLUMN "reservationId",
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
