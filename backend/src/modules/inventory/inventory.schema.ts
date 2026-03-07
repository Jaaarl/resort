import { z } from "zod";

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["SHOP", "MAINTENANCE"]),
  quantity: z.number().int().min(0).default(0),
  unit: z.string().min(1, "Unit is required"),
  lowStockAlert: z.number().int().positive("Low stock alert must be positive"),
  price: z.number().positive().optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const createMovementSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive("Quantity must be positive"),
  reason: z.string().optional(),
  createdById: z.string().min(1, "Creator is required"),
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type CreateMovementInput = z.infer<typeof createMovementSchema>;