/*
  Warnings:

  - You are about to drop the column `poolDate` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `poolSlotId` on the `Reservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_poolSlotId_fkey";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "poolDate",
DROP COLUMN "poolSlotId";

-- CreateTable
CREATE TABLE "ReservationPoolSlot" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "poolSlotId" TEXT NOT NULL,
    "poolDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationPoolSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservationPoolSlot_poolSlotId_poolDate_key" ON "ReservationPoolSlot"("poolSlotId", "poolDate");

-- AddForeignKey
ALTER TABLE "ReservationPoolSlot" ADD CONSTRAINT "ReservationPoolSlot_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPoolSlot" ADD CONSTRAINT "ReservationPoolSlot_poolSlotId_fkey" FOREIGN KEY ("poolSlotId") REFERENCES "PoolSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
