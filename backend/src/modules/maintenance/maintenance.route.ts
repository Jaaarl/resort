import { Router } from "express";
import * as maintenanceController from "./maintenance.controller";
import { validate } from "../../middleware/validate";
import {
  createMaintenanceTaskSchema,
  updateMaintenanceTaskSchema,
  completeMaintenanceTaskSchema,
  updateTaskStatusSchema,
} from "./maintenance.schema";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, maintenanceController.getAllTasks);
router.get(
  "/frequency/:frequency",
  authenticate,
  maintenanceController.getTasksByFrequency,
);
router.get(
  "/user/:userId",
  authenticate,
  maintenanceController.getTasksByAssignedUser,
);
router.get("/:id", authenticate, maintenanceController.getTaskById);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createMaintenanceTaskSchema),
  maintenanceController.createTask,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateMaintenanceTaskSchema),
  maintenanceController.updateTask,
);
router.patch(
  "/:id/status",
  authenticate,
  validate(updateTaskStatusSchema),
  maintenanceController.updateTaskStatus,
);
router.patch(
  "/:id/complete",
  authenticate,
  validate(completeMaintenanceTaskSchema),
  maintenanceController.completeTask,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  maintenanceController.deleteTask,
);

export default router;
