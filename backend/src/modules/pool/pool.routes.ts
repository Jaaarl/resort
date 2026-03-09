import { Router } from "express";
import * as poolController from "./pool.controller";
import { validate } from "../../middleware/validate";
import {
  createPoolSlotSchema,
  updatePoolSlotSchema,
  disablePoolSlotSchema,
} from "./pool.schema";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, poolController.getAllPoolSlots);
router.get("/availability/:date", poolController.getPoolSlotAvailability); // public
router.get("/:id", authenticate, poolController.getPoolSlotById);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createPoolSlotSchema),
  poolController.createPoolSlot,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updatePoolSlotSchema),
  poolController.updatePoolSlot,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  poolController.deletePoolSlot,
);
router.post(
  "/disable",
  authenticate,
  authorize("ADMIN"),
  validate(disablePoolSlotSchema),
  poolController.disablePoolSlot,
);
router.delete(
  "/enable/:label/:date",
  authenticate,
  authorize("ADMIN"),
  poolController.enablePoolSlot,
);

export default router;
