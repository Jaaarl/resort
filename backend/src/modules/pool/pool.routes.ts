import { Router } from "express";
import * as poolController from "./pool.controller";
import { validate } from "../../middleware/validate";
import {
  createPoolSlotSchema,
  updatePoolSlotSchema,
  disablePoolSlotSchema,
} from "./pool.schema";

const router = Router();

router.get("/", poolController.getAllPoolSlots);
router.get("/availability/:date", poolController.getPoolSlotAvailability);
router.get("/:id", poolController.getPoolSlotById);
router.post("/", validate(createPoolSlotSchema), poolController.createPoolSlot);
router.put(
  "/:id",
  validate(updatePoolSlotSchema),
  poolController.updatePoolSlot,
);
router.delete("/:id", poolController.deletePoolSlot);

// disable/enable routes
router.post(
  "/disable",
  validate(disablePoolSlotSchema),
  poolController.disablePoolSlot,
);
router.delete("/enable/:label/:date", poolController.enablePoolSlot);

export default router;
