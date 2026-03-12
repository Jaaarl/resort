import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import { CreateRoomInput, UpdateRoomInput } from "./room.schema";

export const getAllRooms = async () => {
  return await prisma.room.findMany({
    where: { isActive: true },
  });
};

export const getRoomById = async (id: string) => {
  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) throw new AppError("Room not found", 404);

  return room;
};

export const createRoom = async (data: CreateRoomInput) => {
  return await prisma.room.create({
    data,
  });
};

export const updateRoom = async (id: string, data: UpdateRoomInput) => {
  await getRoomById(id); // check if exists

  return await prisma.room.update({
    where: { id },
    data,
  });
};

export const deleteRoom = async (id: string) => {
  await getRoomById(id); // check if exists

  return await prisma.room.update({
    where: { id },
    data: { isActive: false }, // soft delete
  });
};

export const getRoomAvailability = async (
  checkIn: string,
  checkOut: string,
) => {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    include: {
      reservationRooms: {
        where: {
          checkIn: { lt: new Date(checkOut) },
          checkOut: { gt: new Date(checkIn) },
          reservation: {
            status: { notIn: ["CANCELLED"] },
          },
        },
      },
    },
  });

  return rooms.map((room) => ({
    ...room,
    isAvailable: room.reservationRooms.length === 0,
  }));
};
