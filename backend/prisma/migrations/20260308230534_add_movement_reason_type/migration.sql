-- CreateEnum
CREATE TYPE "MovementReason" AS ENUM ('SOLD', 'EXPIRED', 'DAMAGED', 'USED', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "InventoryMovement" ADD COLUMN     "reasonType" "MovementReason";
