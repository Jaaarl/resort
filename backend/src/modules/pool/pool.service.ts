import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import {
  CreatePoolSlotInput,
  UpdatePoolSlotInput,
  DisablePoolSlotInput,
} from "./pool.schema";

export const getAllPoolSlots = async () => {
  return await prisma.poolSlot.findMany({
    orderBy: { label: "asc" },
  });
};

export const getPoolSlotById = async (id: string) => {
  const slot = await prisma.poolSlot.findUnique({
    where: { id },
  });

  if (!slot) throw new AppError("Pool slot not found", 404);

  return slot;
};

export const getPoolSlotAvailability = async (date: string) => {
  const slots = await prisma.poolSlot.findMany();

  const availability = await Promise.all(
    slots.map(async (slot) => {
      // check if disabled on this date
      const isDisabled = await prisma.poolSlotDisabled.findUnique({
        where: {
          label_date: {
            label: slot.label,
            date: new Date(date),
          },
        },
      });

      // check if already reserved on this date
      const isReserved = await prisma.reservationPoolSlot.findFirst({
        where: {
          poolSlotId: slot.id,
          poolDate: new Date(date),
          reservation: {
            status: { notIn: ["CANCELLED"] },
          },
        },
      });

      return {
        ...slot,
        date,
        isAvailable: !isDisabled && !isReserved,
        disabledReason: isDisabled?.reason || null,
      };
    }),
  );

  return availability;
};

export const createPoolSlot = async (data: CreatePoolSlotInput) => {
  // only 2 slots allowed (MORNING and AFTERNOON)
  const existing = await prisma.poolSlot.findFirst({
    where: { label: data.label },
  });

  if (existing) {
    throw new AppError(`A ${data.label} slot already exists`, 409);
  }

  return await prisma.poolSlot.create({
    data,
  });
};

export const updatePoolSlot = async (id: string, data: UpdatePoolSlotInput) => {
  await getPoolSlotById(id);

  return await prisma.poolSlot.update({
    where: { id },
    data,
  });
};

export const disablePoolSlot = async (data: DisablePoolSlotInput) => {
  // check if already disabled
  const existing = await prisma.poolSlotDisabled.findUnique({
    where: {
      label_date: {
        label: data.label,
        date: new Date(data.date),
      },
    },
  });

  if (existing) {
    throw new AppError(
      `${data.label} slot is already disabled on this date`,
      409,
    );
  }

  // check if already reserved on this date
  const slot = await prisma.poolSlot.findFirst({
    where: { label: data.label },
  });

  if (slot) {
    const isReserved = await prisma.reservationPoolSlot.findUnique({
      where: {
        poolSlotId_poolDate: {
          poolSlotId: slot.id,
          poolDate: new Date(data.date),
        },
      },
    });

    if (isReserved) {
      throw new AppError(
        `Cannot disable ${data.label} slot on this date — it already has a reservation`,
        400,
      );
    }
  }

  return await prisma.poolSlotDisabled.create({
    data: {
      label: data.label,
      date: new Date(data.date),
      reason: data.reason,
    },
  });
};

export const enablePoolSlot = async (label: string, date: string) => {
  const disabled = await prisma.poolSlotDisabled.findUnique({
    where: {
      label_date: {
        label: label as any,
        date: new Date(date),
      },
    },
  });

  if (!disabled) {
    throw new AppError(`${label} slot is not disabled on this date`, 404);
  }

  return await prisma.poolSlotDisabled.delete({
    where: {
      label_date: {
        label: label as any,
        date: new Date(date),
      },
    },
  });
};

export const deletePoolSlot = async (id: string) => {
  await getPoolSlotById(id);

  return await prisma.poolSlot.delete({
    where: { id },
  });
};
