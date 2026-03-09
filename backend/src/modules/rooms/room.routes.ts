import { Router } from "express";
import * as roomController from "./room.controller";
import { validate } from "../../middleware/validate";
import { createRoomSchema, updateRoomSchema } from "./room.schema";
import { authenticate, authorize } from "../../middleware/auth";
const router = Router();

router.get("/", authenticate, roomController.getAllRooms);
router.get("/:id", authenticate, roomController.getRoomById);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createRoomSchema),
  roomController.createRoom,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateRoomSchema),
  roomController.updateRoom,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  roomController.deleteRoom,
);

export default router;
