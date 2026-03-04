import { Router } from "express";
import * as poolController from "./pool.controller";
import { validate } from "../../middleware/validate";
import { createPoolSlotSchema, updatePoolSlotSchema } from "./pool.schema";

const router = Router();

router.get("/", poolController.getAllPoolSlots);
router.get("/date/:date", poolController.getPoolSlotsByDate);
router.get("/:id", poolController.getPoolSlotById);
router.post("/", validate(createPoolSlotSchema), poolController.createPoolSlot);
router.put("/:id", validate(updatePoolSlotSchema), poolController.updatePoolSlot);
router.delete("/:id", poolController.deletePoolSlot);

export default router;