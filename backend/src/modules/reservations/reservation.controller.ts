import { Request, Response, NextFunction } from "express";
import * as reservationService from "./reservation.service";

export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservations = await reservationService.getAllReservations();
    res.json({ status: "ok", data: reservations });
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id as string);
    res.json({ status: "ok", data: reservation });
  } catch (error) {
    next(error);
  }
};

export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservation = await reservationService.createReservation(req.body);
    res.status(201).json({ status: "ok", data: reservation });
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservation = await reservationService.updateReservationStatus(
      req.params.id as string,
      req.body
    );
    res.json({ status: "ok", data: reservation });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await reservationService.cancelReservation(req.params.id as string);
    res.json({ status: "ok", message: "Reservation cancelled successfully" });
  } catch (error) {
    next(error);
  }
};