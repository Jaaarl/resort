import { z } from "zod";

export const createPoolSlotSchema = z.object({
  label: z.enum(["MORNING", "AFTERNOON"]),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  capacity: z.number().int().positive(),
  price: z.number().positive(),
});

export const updatePoolSlotSchema = createPoolSlotSchema.partial();

export const disablePoolSlotSchema = z.object({
  label: z.enum(["MORNING", "AFTERNOON"]),
  date: z.string().datetime(),
  reason: z.string().optional(),
});

export type CreatePoolSlotInput = z.infer<typeof createPoolSlotSchema>;
export type UpdatePoolSlotInput = z.infer<typeof updatePoolSlotSchema>;
export type DisablePoolSlotInput = z.infer<typeof disablePoolSlotSchema>;
