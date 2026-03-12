import { Request, Response, NextFunction } from "express";
import * as roomService from "./room.service";

export const getAllRooms = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rooms = await roomService.getAllRooms();
    res.json({ status: "ok", data: rooms });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const room = await roomService.getRoomById(req.params.id as string);
    res.json({ status: "ok", data: room });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const room = await roomService.createRoom(req.body);
    res.status(201).json({ status: "ok", data: room });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const room = await roomService.updateRoom(
      req.params.id as string,
      req.body,
    );
    res.json({ status: "ok", data: room });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await roomService.deleteRoom(req.params.id as string);
    res.json({ status: "ok", message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getRoomAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { checkIn, checkOut } = req.query;
    const rooms = await roomService.getRoomAvailability(
      checkIn as string,
      checkOut as string,
    );
    res.json({ status: "ok", data: rooms });
  } catch (error) {
    next(error);
  }
};
