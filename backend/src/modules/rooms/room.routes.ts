import { Router } from "express";
import * as roomController from "./room.controller";
import { validate } from "../../middleware/validate";
import { createRoomSchema, updateRoomSchema } from "./room.schema";

const router = Router();

router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);
router.post("/", validate(createRoomSchema), roomController.createRoom);
router.put("/:id", validate(updateRoomSchema), roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

export default router;