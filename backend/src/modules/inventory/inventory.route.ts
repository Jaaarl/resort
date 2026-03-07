import { Router } from "express";
import * as inventoryController from "./inventory.controller";
import { validate } from "../../middleware/validate";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  createMovementSchema,
} from "./inventory.schema";

const router = Router();

router.get("/", inventoryController.getAllItems);
router.get("/low-stock", inventoryController.getLowStockItems);
router.get("/movements", inventoryController.getAllMovements);
router.get("/:id", inventoryController.getItemById);
router.get("/:id/movements", inventoryController.getMovementsByItem);
router.post("/", validate(createInventoryItemSchema), inventoryController.createItem);
router.post("/movements", validate(createMovementSchema), inventoryController.createMovement);
router.put("/:id", validate(updateInventoryItemSchema), inventoryController.updateItem);
router.delete("/:id", inventoryController.deleteItem);

export default router;