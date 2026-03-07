/*
  Warnings:

  - Added the required column `updatedAt` to the `AddOn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ReservationAddOn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AddOn" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ReservationAddOn" ADD COLUMN     "price" DECIMAL(65,30) NOT NULL;
