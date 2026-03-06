import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import {
  CreateReservationInput,
  UpdateReservationStatusInput,
} from "./reservation.schema";

export const getAllReservations = async () => {
  return await prisma.reservation.findMany({
    include: {
      room: true,
      poolSlot: true,
      addOns: true,
    },
  });
};

export const getReservationById = async (id: string) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      room: true,
      poolSlot: true,
      addOns: true,
    },
  });

  if (!reservation) throw new AppError("Reservation not found", 404);

  return reservation;
};

export const createReservation = async (data: CreateReservationInput) => {
  // ROOM conflict detection
  if (data.type === "ROOM" || data.type === "BOTH") {
    const room = await prisma.room.findUnique({
      where: { id: data.roomId! },
    });

    if (!room) throw new AppError("Room not found", 404);
    if (!room.isActive) throw new AppError("Room is not available", 400);

    if (data.totalPerson > room.capacity) {
      throw new AppError(`Room capacity is ${room.capacity} persons only`, 400);
    }

    // check for overlapping reservations
    const conflict = await prisma.reservation.findFirst({
      where: {
        roomId: data.roomId,
        status: { notIn: ["CANCELLED"] },
        AND: [
          { checkIn: { lt: new Date(data.checkOut!) } },
          { checkOut: { gt: new Date(data.checkIn!) } },
        ],
      },
    });

    if (conflict)
      throw new AppError("Room is already booked for these dates", 409);
  }

  // POOL conflict detection
  if (data.type === "POOL" || data.type === "BOTH") {
    const poolSlot = await prisma.poolSlot.findUnique({
      where: { id: data.poolSlotId! },
    });

    if (!poolSlot) throw new AppError("Pool slot not found", 404);

    // check if disabled on this date
    const isDisabled = await prisma.poolSlotDisabled.findUnique({
      where: {
        label_date: {
          label: poolSlot.label,
          date: new Date(data.poolDate!),
        },
      },
    });

    if (isDisabled) {
      throw new AppError(
        `${poolSlot.label} slot is not available on this date${isDisabled.reason ? `: ${isDisabled.reason}` : ""}`,
        400,
      );
    }

    // check if already reserved on this date
    const poolConflict = await prisma.reservation.findFirst({
      where: {
        poolSlotId: data.poolSlotId,
        poolDate: new Date(data.poolDate!),
        status: { notIn: ["CANCELLED"] },
      },
    });

    if (poolConflict)
      throw new AppError("Pool slot is already reserved on this date", 409);
  }

  return await prisma.reservation.create({
    data: {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerLocation: data.customerLocation,
      type: data.type,
      totalPerson: data.totalPerson,
      roomId: data.roomId,
      checkIn: data.checkIn ? new Date(data.checkIn) : null,
      checkOut: data.checkOut ? new Date(data.checkOut) : null,
      poolSlotId: data.poolSlotId,
      poolDate: data.poolDate ? new Date(data.poolDate) : null, // add this line
      totalAmount: data.totalAmount,
      status: "PENDING",
    },
    include: {
      room: true,
      poolSlot: true,
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
