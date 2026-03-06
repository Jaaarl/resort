import { Router } from "express";
import * as maintenanceController from "./maintenance.controller";
import { validate } from "../../middleware/validate";
import {
  createMaintenanceTaskSchema,
  updateMaintenanceTaskSchema,
  completeMaintenanceTaskSchema,
  updateTaskStatusSchema,
} from "./maintenance.schema";

const router = Router();

router.get("/", maintenanceController.getAllTasks);
router.get("/frequency/:frequency", maintenanceController.getTasksByFrequency);
router.get("/user/:userId", maintenanceController.getTasksByAssignedUser);
router.get("/:id", maintenanceController.getTaskById);
router.post(
  "/",
  validate(createMaintenanceTaskSchema),
  maintenanceController.createTask,
);
router.put(
  "/:id",
  validate(updateMaintenanceTaskSchema),
  maintenanceController.updateTask,
);
router.patch(
  "/:id/status",
  validate(updateTaskStatusSchema),
  maintenanceController.updateTaskStatus,
);
router.patch(
  "/:id/complete",
  validate(completeMaintenanceTaskSchema),
  maintenanceController.completeTask,
);
router.delete("/:id", maintenanceController.deleteTask);

export default router;
