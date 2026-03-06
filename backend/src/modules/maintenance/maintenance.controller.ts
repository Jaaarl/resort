import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "./maintenance.service";

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tasks = await maintenanceService.getAllTasks();
    res.json({ status: "ok", data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await maintenanceService.getTaskById(req.params.id as string);
    res.json({ status: "ok", data: task });
  } catch (error) {
    next(error);
  }
};

export const getTasksByAssignedUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tasks = await maintenanceService.getTasksByAssignedUser(
      req.params.userId as string,
    );
    res.json({ status: "ok", data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTasksByFrequency = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tasks = await maintenanceService.getTasksByFrequency(
      req.params.frequency as "DAILY" | "MONTHLY",
    );
    res.json({ status: "ok", data: tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await maintenanceService.createTask(req.body);
    res.status(201).json({ status: "ok", data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await maintenanceService.updateTask(
      req.params.id as string,
      req.body,
    );
    res.json({ status: "ok", data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await maintenanceService.updateTaskStatus(
      req.params.id as string,
      req.body,
    );
    res.json({ status: "ok", data: task });
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await maintenanceService.completeTask(
      req.params.id as string,
      req.body,
    );
    res.json({ status: "ok", data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await maintenanceService.deleteTask(req.params.id as string);
    res.json({ status: "ok", message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
