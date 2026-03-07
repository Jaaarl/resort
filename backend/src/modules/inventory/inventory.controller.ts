import { Request, Response, NextFunction } from "express";
import * as inventoryService from "./inventory.service";

export const getAllItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = req.query.type as "SHOP" | "MAINTENANCE" | undefined;
    const items = await inventoryService.getAllItems(type);
    res.json({ status: "ok", data: items });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await inventoryService.getItemById(req.params.id as string);
    res.json({ status: "ok", data: item });
  } catch (error) {
    next(error);
  }
};

export const getLowStockItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = req.query.type as "SHOP" | "MAINTENANCE" | undefined;
    const items = await inventoryService.getLowStockItems(type);
    res.json({ status: "ok", data: items });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await inventoryService.createItem(req.body);
    res.status(201).json({ status: "ok", data: item });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await inventoryService.updateItem(req.params.id as string, req.body);
    res.json({ status: "ok", data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await inventoryService.deleteItem(req.params.id as string);
    res.json({ status: "ok", message: "Item deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const createMovement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await inventoryService.createMovement(req.body);
    res.status(201).json({ status: "ok", data: result });
  } catch (error) {
    next(error);
  }
};

export const getMovementsByItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movements = await inventoryService.getMovementsByItem(req.params.id as string);
    res.json({ status: "ok", data: movements });
  } catch (error) {
    next(error);
  }
};

export const getAllMovements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movements = await inventoryService.getAllMovements();
    res.json({ status: "ok", data: movements });
  } catch (error) {
    next(error);
  }
};
