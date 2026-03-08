import { Request, Response, NextFunction } from "express";
import * as analyticsService from "./analytics.service";

export const getRoomOccupancyRate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };

    if (!startDate || !endDate) {
      res.status(400).json({
        status: "error",
        message: "startDate and endDate are required",
      });
      return;
    }

    const data = await analyticsService.getRoomOccupancyRate(
      startDate,
      endDate,
    );
    res.json({ status: "ok", data });
  } catch (error) {
    next(error);
  }
};

export const getPoolOccupancyRate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };

    if (!startDate || !endDate) {
      res.status(400).json({
        status: "error",
        message: "startDate and endDate are required",
      });
      return;
    }

    const data = await analyticsService.getPoolOccupancyRate(
      startDate,
      endDate,
    );
    res.json({ status: "ok", data });
  } catch (error) {
    next(error);
  }
};

export const getRevenueReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { period, date } = req.query as {
      period: "DAILY" | "WEEKLY" | "MONTHLY";
      date: string;
    };

    if (!period || !date) {
      res.status(400).json({
        status: "error",
        message: "period and date are required",
      });
      return;
    }

    if (!["DAILY", "WEEKLY", "MONTHLY"].includes(period)) {
      res.status(400).json({
        status: "error",
        message: "period must be DAILY, WEEKLY or MONTHLY",
      });
      return;
    }

    const data = await analyticsService.getRevenueReport(period, date);
    res.json({ status: "ok", data });
  } catch (error) {
    next(error);
  }
};

export const getWalkInVsReservedRatio = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };

    if (!startDate || !endDate) {
      res.status(400).json({
        status: "error",
        message: "startDate and endDate are required",
      });
      return;
    }

    const data = await analyticsService.getWalkInVsReservedRatio(
      startDate,
      endDate,
    );
    res.json({ status: "ok", data });
  } catch (error) {
    next(error);
  }
};

export const getShopSalesReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };

    if (!startDate || !endDate) {
      res.status(400).json({
        status: "error",
        message: "startDate and endDate are required",
      });
      return;
    }

    const data = await analyticsService.getShopSalesReport(startDate, endDate);
    res.json({ status: "ok", data });
  } catch (error) {
    next(error);
  }
};
