import { z } from "zod";

const reservationAddOnSchema = z.object({
  addOnId: z.string().min(1, "Add-on ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
});

const poolSlotReservationSchema = z.object({
  poolSlotId: z.string().min(1, "Pool slot ID is required"),
  poolDate: z.string().datetime(),
});

export const createReservationSchema = z
  .object({
    customerName: z.string().min(1, "Customer name is required"),
    customerPhone: z.string().min(1, "Customer phone is required"),
    customerEmail: z.string().email("Invalid email").optional(),
    customerLocation: z.string().optional(),
    type: z.enum(["ROOM", "POOL", "BOTH"]),
    addOns: z.array(reservationAddOnSchema).optional(),
    totalPerson: z
      .number()
      .int()
      .positive("Total person must be a positive number"),

    // ROOM fields
    roomId: z.string().optional(),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),

    // POOL fields
    // POOL fields
    poolSlots: z.array(poolSlotReservationSchema).optional(),
    totalAmount: z.number().positive("Total amount must be positive"),
  })
  .refine(
    (data) => {
      if (data.type === "ROOM") {
        return !!data.roomId && !!data.checkIn && !!data.checkOut;
      }
      if (data.type === "POOL") {
        return !!data.poolSlots && data.poolSlots.length > 0;
      }
      if (data.type === "BOTH") {
        return (
          !!data.roomId &&
          !!data.checkIn &&
          !!data.checkOut &&
          !!data.poolSlots &&
          data.poolSlots.length > 0
        );
      }
      return true;
    },
    {
      message: "Missing required fields for reservation type",
    },
  );

export const updateReservationStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationStatusInput = z.infer<
  typeof updateReservationStatusSchema
>;
