import { z } from "zod";

export const updatePoolSlotSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
});

export type UpdatePoolSlotInput = z.infer<typeof updatePoolSlotSchema>;