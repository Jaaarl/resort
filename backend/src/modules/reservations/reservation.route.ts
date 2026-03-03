import { Router } from "express";
import * as reservationController from "./reservation.controller";
import { validate } from "../../middleware/validate";
import { createReservationSchema, updateReservationStatusSchema } from "./reservation.schema";

const router = Router();

router.get("/", reservationController.getAllReservations);
router.get("/:id", reservationController.getReservationById);
router.post("/", validate(createReservationSchema), reservationController.createReservation);
router.patch("/:id/status", validate(updateReservationStatusSchema), reservationController.updateReservationStatus);
router.patch("/:id/cancel", reservationController.cancelReservation);

export default router;