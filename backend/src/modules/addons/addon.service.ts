import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import { CreateAddOnInput, UpdateAddOnInput } from "./addon.schema";

export const getAllAddOns = async () => {
  return await prisma.addOn.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
};

export const getAddOnById = async (id: string) => {
  const addOn = await prisma.addOn.findUnique({
    where: { id },
  });

  if (!addOn || !addOn.isActive) throw new AppError("Add-on not found", 404);

  return addOn;
};

export const getAddOnAvailability = async (addOnId: string, date: string) => {
  const addOn = await getAddOnById(addOnId);

  // count how many are already reserved on this date
  const reserved = await prisma.reservationAddOn.aggregate({
    where: {
      addOnId,
      reservation: {
        status: { notIn: ["CANCELLED"] },
        OR: [
          {
            checkIn: { lte: new Date(date) },
            checkOut: { gte: new Date(date) },
          },
          {
            poolSlots: {
              some: {
                poolDate: new Date(date),
              },
            },
          },
        ],
      },
    },
    _sum: { quantity: true },
  });

  const reservedCount = reserved._sum.quantity ?? 0;
  const available = addOn.quantity - reservedCount;

  return {
    addOn,
    date,
    totalQuantity: addOn.quantity,
    reservedQuantity: reservedCount,
    availableQuantity: available,
  };
};

export const checkAddOnAvailability = async (
  addOnId: string,
  quantity: number,
  date: string,
) => {
  const availability = await getAddOnAvailability(addOnId, date);

  if (quantity > availability.availableQuantity) {
    throw new AppError(
      `Only ${availability.availableQuantity} ${availability.addOn.unit ?? "units"} of ${availability.addOn.name} available on this date`,
      400,
    );
  }

  return availability;
};

export const createAddOn = async (data: CreateAddOnInput) => {
  return await prisma.addOn.create({
    data,
  });
};

export const updateAddOn = async (id: string, data: UpdateAddOnInput) => {
  await getAddOnById(id);

  return await prisma.addOn.update({
    where: { id },
    data,
  });
};

export const deleteAddOn = async (id: string) => {
  await getAddOnById(id);

  return await prisma.addOn.update({
    where: { id },
    data: { isActive: false },
  });
};
