import { Router } from "express";
import * as analyticsController from "./analytics.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get(
  "/occupancy/rooms",
  authenticate,
  authorize("ADMIN"),
  analyticsController.getRoomOccupancyRate,
);
router.get(
  "/occupancy/pool",
  authenticate,
  authorize("ADMIN"),
  analyticsController.getPoolOccupancyRate,
);
router.get(
  "/revenue",
  authenticate,
  authorize("ADMIN"),
  analyticsController.getRevenueReport,
);
router.get(
  "/walkin-vs-reserved",
  authenticate,
  authorize("ADMIN"),
  analyticsController.getWalkInVsReservedRatio,
);
router.get(
  "/shop-sales",
  authenticate,
  authorize("ADMIN"),
  analyticsController.getShopSalesReport,
);

export default router;
