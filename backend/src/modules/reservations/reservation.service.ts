import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import { checkAddOnAvailability } from "../addons/addon.service";
import {
  CreateReservationInput,
  UpdateReservationStatusInput,
} from "./reservation.schema";

export const getAllReservations = async () => {
  return await prisma.reservation.findMany({
    include: {
      rooms: { include: { room: true } },
      poolSlots: { include: { poolSlot: true } },
      addOns: { include: { addOn: true } },
    },
  });
};

export const getReservationById = async (id: string) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      rooms: { include: { room: true } },
      poolSlots: { include: { poolSlot: true } },
      addOns: { include: { addOn: true } },
    },
  });

  if (!reservation) throw new AppError("Reservation not found", 404);

  return reservation;
};

export const createReservation = async (data: CreateReservationInput) => {
  // ROOM conflict detection
  if (data.type === "ROOM" || data.type === "BOTH") {
    if (!data.rooms || data.rooms.length === 0) {
      throw new AppError("At least one room is required", 400);
    }

    for (const roomData of data.rooms) {
      const room = await prisma.room.findUnique({
        where: { id: roomData.roomId },
      });

      if (!room) throw new AppError("Room not found", 404);
      if (!room.isActive) throw new AppError("Room is not available", 400);

      if (data.totalPerson > room.capacity) {
        throw new AppError(
          `Room capacity is ${room.capacity} persons only`,
          400,
        );
      }

      const conflict = await prisma.reservationRoom.findFirst({
        where: {
          roomId: roomData.roomId,
          reservation: { status: { notIn: ["CANCELLED"] } },
          AND: [
            { checkIn: { lt: new Date(roomData.checkOut) } },
            { checkOut: { gt: new Date(roomData.checkIn) } },
          ],
        },
      });

      if (conflict)
        throw new AppError(`Room is already booked for these dates`, 409);
    }
  }

  // POOL conflict detection
  if (data.type === "POOL" || data.type === "BOTH") {
    if (!data.poolSlots || data.poolSlots.length === 0) {
      throw new AppError("At least one pool slot is required", 400);
    }

    for (const slot of data.poolSlots) {
      const poolSlot = await prisma.poolSlot.findUnique({
        where: { id: slot.poolSlotId },
      });

      if (!poolSlot) throw new AppError("Pool slot not found", 404);

      // check if disabled on this date
      const isDisabled = await prisma.poolSlotDisabled.findUnique({
        where: {
          label_date: {
            label: poolSlot.label,
            date: new Date(slot.poolDate),
          },
        },
      });

      if (isDisabled) {
        throw new AppError(
          `${poolSlot.label} slot is not available on this date${isDisabled.reason ? `: ${isDisabled.reason}` : ""}`,
          400,
        );
      }

      // check if already reserved
      const conflict = await prisma.reservationPoolSlot.findUnique({
        where: {
          poolSlotId_poolDate: {
            poolSlotId: slot.poolSlotId,
            poolDate: new Date(slot.poolDate),
          },
        },
      });

      if (conflict) {
        throw new AppError(
          `${poolSlot.label} slot is already reserved on this date`,
          409,
        );
      }
    }
  }

  // ADDON availability check
  if (data.addOns && data.addOns.length > 0) {
    const date =
      data.type === "ROOM"
        ? data.rooms![0].checkIn // ← change this
        : data.poolSlots![0].poolDate; // ← and this

    for (const addOn of data.addOns) {
      await checkAddOnAvailability(addOn.addOnId, addOn.quantity, date);
    }
  }

  return await prisma.reservation.create({
    data: {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerLocation: data.customerLocation,
      type: data.type,
      totalPerson: data.totalPerson,
      totalAmount: data.totalAmount.toString(),
      status: "PENDING",
      rooms:
        data.rooms && data.rooms.length > 0
          ? {
              create: data.rooms.map((room) => ({
                roomId: room.roomId,
                checkIn: new Date(room.checkIn),
                checkOut: new Date(room.checkOut),
              })),
            }
          : undefined,
      poolSlots:
        data.poolSlots && data.poolSlots.length > 0
          ? {
              create: data.poolSlots.map((slot) => ({
                poolSlotId: slot.poolSlotId,
                poolDate: new Date(slot.poolDate),
              })),
            }
          : undefined,
      addOns:
        data.addOns && data.addOns.length > 0
          ? {
              create: await Promise.all(
                data.addOns.map(async (addOn) => {
                  const addOnRecord = await prisma.addOn.findUnique({
                    where: { id: addOn.addOnId },
                  });
                  return {
                    addOnId: addOn.addOnId,
                    quantity: addOn.quantity,
                    price: addOnRecord!.price,
                  };
                }),
              ),
            }
          : undefined,
    },
    include: {
      rooms: { include: { room: true } },
      poolSlots: { include: { poolSlot: true } },
      addOns: { include: { addOn: true } },
    },
  });
};

export const updateReservationStatus = async (
  id: string,
  data: UpdateReservationStatusInput,
) => {
  await getReservationById(id); // check if exists

  return await prisma.reservation.update({
    where: { id },
    data: { status: data.status },
  });
};

export const cancelReservation = async (id: string) => {
  const reservation = await getReservationById(id);

  if (reservation.status === "COMPLETED") {
    throw new AppError("Cannot cancel a completed reservation", 400);
  }

  return await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};
