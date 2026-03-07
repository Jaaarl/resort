import { z } from "zod";

export const createAddOnSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
  unit: z.string().optional(),
});

export const updateAddOnSchema = createAddOnSchema.partial();

export const reservationAddOnSchema = z.object({
  addOnId: z.string().min(1, "Add-on ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
});

export type CreateAddOnInput = z.infer<typeof createAddOnSchema>;
export type UpdateAddOnInput = z.infer<typeof updateAddOnSchema>;
export type ReservationAddOnInput = z.infer<typeof reservationAddOnSchema>;