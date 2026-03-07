import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  CreateMovementInput,
} from "./inventory.schema";

export const getAllItems = async (type?: "SHOP" | "MAINTENANCE") => {
  return await prisma.inventoryItem.findMany({
    where: {
      isActive: true,
      ...(type ? { type } : {}),
    },
    orderBy: { name: "asc" },
  });
};

export const getItemById = async (id: string) => {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { movements: true },
  });

  if (!item) throw new AppError("Inventory item not found", 404);

  return item;
};

export const getLowStockItems = async (type?: "SHOP" | "MAINTENANCE") => {
  return await prisma.inventoryItem.findMany({
    where: {
      isActive: true,
      ...(type ? { type } : {}),
      quantity: { lte: prisma.inventoryItem.fields.lowStockAlert },
    },
  });
};


export const createItem = async (data: CreateInventoryItemInput) => {
  return await prisma.inventoryItem.create({
    data,
  });
};

export const updateItem = async (id: string, data: UpdateInventoryItemInput) => {
  await getItemById(id);

  return await prisma.inventoryItem.update({
    where: { id },
    data,
  });
};

export const deleteItem = async (id: string) => {
  await getItemById(id);

  return await prisma.inventoryItem.update({
    where: { id },
    data: { isActive: false },
  });
};

export const createMovement = async (data: CreateMovementInput) => {
  const item = await getItemById(data.itemId);

  // prevent negative stock
  if (data.type === "OUT" && item.quantity < data.quantity) {
    throw new AppError(
      `Insufficient stock — only ${item.quantity} ${item.unit} available`,
      400
    );
  }

  // update quantity
  const updatedItem = await prisma.inventoryItem.update({
    where: { id: data.itemId },
    data: {
      quantity:
        data.type === "IN"
          ? item.quantity + data.quantity
          : item.quantity - data.quantity,
    },
  });

  // create movement record
  const movement = await prisma.inventoryMovement.create({
    data: {
      itemId: data.itemId,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      createdById: data.createdById,
    },
  });

  // check low stock after OUT movement
  if (data.type === "OUT" && updatedItem.quantity <= updatedItem.lowStockAlert) {
    console.warn(`⚠️ Low stock alert: ${updatedItem.name} has ${updatedItem.quantity} ${updatedItem.unit} remaining`);
  }

  return { movement, updatedItem };
};

export const getMovementsByItem = async (itemId: string) => {
  // check if item exists regardless of isActive
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) throw new AppError("Inventory item not found", 404);

  return await prisma.inventoryMovement.findMany({
    where: { itemId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
