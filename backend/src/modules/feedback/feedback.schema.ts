import { z } from "zod";

export const createFeedbackSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  customerName: z.string().optional(),
  customerEmail: z.string().email("Invalid email").optional(),
  customerPhone: z.string().optional(),
}).refine((data) => {
  // if not anonymous, customerName is required
  if (!data.isAnonymous && !data.customerName) {
    return false;
  }
  return true;
}, {
  message: "Customer name is required if not anonymous",
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
