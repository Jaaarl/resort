/*
  Warnings:

  - You are about to drop the column `date` on the `PoolSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[label]` on the table `PoolSlot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `label` to the `PoolSlot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PoolSlotLabel" AS ENUM ('MORNING', 'AFTERNOON');

-- DropIndex
DROP INDEX "Reservation_poolSlotId_key";

-- AlterTable
ALTER TABLE "PoolSlot" DROP COLUMN "date",
ADD COLUMN     "label" "PoolSlotLabel" NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "poolDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PoolSlotDisabled" (
    "id" TEXT NOT NULL,
    "label" "PoolSlotLabel" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolSlotDisabled_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoolSlotDisabled_label_date_key" ON "PoolSlotDisabled"("label", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PoolSlot_label_key" ON "PoolSlot"("label");
