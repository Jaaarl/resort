import { z } from "zod";

export const createPoolSlotSchema = z.object({
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  capacity: z.number().int().positive(),
  price: z.number().positive(),
  label: z.enum(["MORNING", "AFTERNOON"]), // add this
});

export const updatePoolSlotSchema = createPoolSlotSchema.partial();

export type CreatePoolSlotInput = z.infer<typeof createPoolSlotSchema>;
export type UpdatePoolSlotInput = z.infer<typeof updatePoolSlotSchema>;