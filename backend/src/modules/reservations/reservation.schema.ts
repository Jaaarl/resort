import { z } from "zod";

const reservationAddOnSchema = z.object({
  addOnId: z.string().min(1, "Add-on ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
});

const poolSlotReservationSchema = z.object({
  poolSlotId: z.string().min(1, "Pool slot ID is required"),
  poolDate: z.string().datetime(),
});

const roomReservationSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
});

export const createReservationSchema = z
  .object({
    customerName: z.string().min(1, "Customer name is required"),
    customerPhone: z.string().min(1, "Customer phone is required"),
    customerEmail: z.string().email("Invalid email").optional(),
    customerLocation: z.string().optional(),
    type: z.enum(["ROOM", "POOL", "BOTH"]),
    totalPerson: z.number().int().positive(),
    totalAmount: z.number().positive(),
    addOns: z.array(reservationAddOnSchema).optional(),

    // replace roomId, checkIn, checkOut with rooms array
    rooms: z.array(roomReservationSchema).optional(),

    // pool
    poolSlots: z.array(poolSlotReservationSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "ROOM") {
        return !!data.rooms && data.rooms.length > 0;
      }
      if (data.type === "POOL") {
        return !!data.poolSlots && data.poolSlots.length > 0;
      }
      if (data.type === "BOTH") {
        return (
          !!data.rooms &&
          data.rooms.length > 0 &&
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
