import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import { CreatePoolSlotInput, UpdatePoolSlotInput } from "./pool.schema";

export const getAllPoolSlots = async () => {
  return await prisma.poolSlot.findMany({
    include: { reservation: true },
    orderBy: { date: "asc" },
  });
};

export const getPoolSlotById = async (id: string) => {
  const slot = await prisma.poolSlot.findUnique({
    where: { id },
    include: { reservation: true },
  });

  if (!slot) throw new AppError("Pool slot not found", 404);

  return slot;
};

export const getPoolSlotsByDate = async (date: string) => {
  return await prisma.poolSlot.findMany({
    where: {
      date: new Date(date),
    },
    include: { reservation: true },
    orderBy: { startTime: "asc" },
  });
};

export const createPoolSlot = async (data: CreatePoolSlotInput) => {
  // check if label already exists for this date
  const existing = await prisma.poolSlot.findFirst({
    where: {
      date: new Date(data.date),
      label: data.label,
    },
  });

  if (existing) {
    throw new AppError(
      `A ${data.label} slot already exists for this date`,
      409
    );
  }

  // check if date already has 2 slots
  const slotsOnDate = await prisma.poolSlot.count({
    where: { date: new Date(data.date) },
  });

  if (slotsOnDate >= 2) {
    throw new AppError("This date already has 2 pool slots", 409);
  }

  return await prisma.poolSlot.create({
    data: {
      date: new Date(data.date),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      capacity: data.capacity,
      price: data.price,
      label: data.label,
    },
  });
};

export const updatePoolSlot = async (id: string, data: UpdatePoolSlotInput) => {
  await getPoolSlotById(id); // check if exists

  return await prisma.poolSlot.update({
    where: { id },
    data: {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.startTime && { startTime: new Date(data.startTime) }),
      ...(data.endTime && { endTime: new Date(data.endTime) }),
      ...(data.capacity && { capacity: data.capacity }),
      ...(data.price && { price: data.price }),
      ...(data.label && { label: data.label }),
    },
  });
};

export const deletePoolSlot = async (id: string) => {
  const slot = await getPoolSlotById(id);

  if (slot.reservation) {
    throw new AppError("Cannot delete a slot that has a reservation", 400);
  }

  return await prisma.poolSlot.delete({
    where: { id },
  });
};
