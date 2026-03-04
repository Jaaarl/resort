import { Request, Response, NextFunction } from "express";
import * as poolService from "./pool.service";

export const getAllPoolSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slots = await poolService.getAllPoolSlots();
    res.json({ status: "ok", data: slots });
  } catch (error) {
    next(error);
  }
};

export const getPoolSlotById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slot = await poolService.getPoolSlotById(req.params.id as string);
    res.json({ status: "ok", data: slot });
  } catch (error) {
    next(error);
  }
};

export const getPoolSlotsByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slot = await poolService.getPoolSlotsByDate(req.params.date as string);
    res.json({ status: "ok", data: slot });
  } catch (error) {
    next(error);
  }
};

export const createPoolSlot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slot = await poolService.createPoolSlot(req.body);
    res.status(201).json({ status: "ok", data: slot });
  } catch (error) {
    next(error);
  }
};

export const updatePoolSlot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slot = await poolService.updatePoolSlot(req.params.id as string, req.body);
    res.json({ status: "ok", data: slot });
  } catch (error) {
    next(error);
  }
};

export const deletePoolSlot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await poolService.deletePoolSlot(req.params.id as string);
    res.json({ status: "ok", message: "Pool slot deleted successfully" });
  } catch (error) {
    next(error);
  }
};
