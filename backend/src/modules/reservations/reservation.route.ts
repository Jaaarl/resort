import { Router } from "express";
import * as reservationController from "./reservation.controller";
import { validate } from "../../middleware/validate";
import {
  createReservationSchema,
  updateReservationStatusSchema,
} from "./reservation.schema";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, reservationController.getAllReservations);
router.get("/:id", authenticate, reservationController.getReservationById);
router.post(
  "/",
  authenticate,
  validate(createReservationSchema),
  reservationController.createReservation,
);
router.patch(
  "/:id/status",
  authenticate,
  validate(updateReservationStatusSchema),
  reservationController.updateReservationStatus,
);
router.patch(
  "/:id/cancel",
  authenticate,
  reservationController.cancelReservation,
);
router.put("/:id", authenticate, reservationController.updateReservation);

export default router;
