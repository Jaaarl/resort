import { Router } from "express";
import * as addonController from "./addon.controller";
import { validate } from "../../middleware/validate";
import { createAddOnSchema, updateAddOnSchema } from "./addon.schema";

const router = Router();

router.get("/", addonController.getAllAddOns);
router.get("/:id", addonController.getAddOnById);
router.get("/:id/availability", addonController.getAddOnAvailability);
router.post("/", validate(createAddOnSchema), addonController.createAddOn);
router.put("/:id", validate(updateAddOnSchema), addonController.updateAddOn);
router.delete("/:id", addonController.deleteAddOn);

export default router;