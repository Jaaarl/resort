import { Request, Response, NextFunction } from "express";
import * as addonService from "./addon.service";

export const getAllAddOns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const addOns = await addonService.getAllAddOns();
    res.json({ status: "ok", data: addOns });
  } catch (error) {
    next(error);
  }
};

export const getAddOnById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const addOn = await addonService.getAddOnById(req.params.id as string);
    res.json({ status: "ok", data: addOn });
  } catch (error) {
    next(error);
  }
};

export const getAddOnAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { date } = req.query as { date: string };

    if (!date) {
      res.status(400).json({ status: "error", message: "Date is required" });
      return;
    }

    const availability = await addonService.getAddOnAvailability(id as string, date);
    res.json({ status: "ok", data: availability });
  } catch (error) {
    next(error);
  }
};

export const createAddOn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const addOn = await addonService.createAddOn(req.body);
    res.status(201).json({ status: "ok", data: addOn });
  } catch (error) {
    next(error);
  }
};

export const updateAddOn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const addOn = await addonService.updateAddOn(req.params.id as string, req.body);
    res.json({ status: "ok", data: addOn });
  } catch (error) {
    next(error);
  }
};

export const deleteAddOn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await addonService.deleteAddOn(req.params.id as string);
    res.json({ status: "ok", message: "Add-on deleted successfully" });
  } catch (error) {
    next(error);
  }
};
