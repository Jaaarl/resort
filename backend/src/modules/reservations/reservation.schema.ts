import { z } from "zod";

export const createReservationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerEmail: z.string().email("Invalid email").optional(),
  customerLocation: z.string().optional(),
  type: z.enum(["ROOM", "POOL", "BOTH"]),
  totalPerson: z.number().int().positive("Total person must be a positive number"),

  // ROOM fields
  roomId: z.string().optional(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),

  // POOL fields
  poolSlotId: z.string().optional(),

  totalAmount: z.number().positive("Total amount must be positive"),

}).refine((data) => {
  if (data.type === "ROOM") {
    return !!data.roomId && !!data.checkIn && !!data.checkOut;
  }
  if (data.type === "POOL") {
    return !!data.poolSlotId;
  }
  if (data.type === "BOTH") {
    return !!data.roomId && !!data.checkIn && !!data.checkOut && !!data.poolSlotId;
  }
  return true;
}, {
  message: "Missing required fields for reservation type",
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusSchema>;