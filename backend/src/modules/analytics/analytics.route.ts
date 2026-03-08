import { Router } from "express";
import * as analyticsController from "./analytics.controller";

const router = Router();

router.get("/occupancy/rooms", analyticsController.getRoomOccupancyRate);
router.get("/occupancy/pool", analyticsController.getPoolOccupancyRate);
router.get("/revenue", analyticsController.getRevenueReport);
router.get("/walkin-vs-reserved", analyticsController.getWalkInVsReservedRatio);

export default router;
