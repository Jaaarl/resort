import { Router } from "express";
import * as addonController from "./addon.controller";
import { validate } from "../../middleware/validate";
import { createAddOnSchema, updateAddOnSchema } from "./addon.schema";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, addonController.getAllAddOns);
router.get("/:id", authenticate, addonController.getAddOnById);
router.get(
  "/:id/availability",
  authenticate,
  addonController.getAddOnAvailability,
);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createAddOnSchema),
  addonController.createAddOn,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateAddOnSchema),
  addonController.updateAddOn,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  addonController.deleteAddOn,
);

export default router;
