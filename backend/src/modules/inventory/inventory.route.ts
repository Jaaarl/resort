import { Router } from "express";
import * as inventoryController from "./inventory.controller";
import { validate } from "../../middleware/validate";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  createMovementSchema,
} from "./inventory.schema";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, inventoryController.getAllItems);
router.get("/low-stock", authenticate, inventoryController.getLowStockItems);
router.get("/movements", authenticate, inventoryController.getAllMovements);
router.get("/:id", authenticate, inventoryController.getItemById);
router.get(
  "/:id/movements",
  authenticate,
  inventoryController.getMovementsByItem,
);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createInventoryItemSchema),
  inventoryController.createItem,
);
router.post(
  "/movements",
  authenticate,
  validate(createMovementSchema),
  inventoryController.createMovement,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateInventoryItemSchema),
  inventoryController.updateItem,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  inventoryController.deleteItem,
);

export default router;
