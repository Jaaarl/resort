import { Router } from "express";
import authRoutes from "../modules/auth/auth";
import roomRoutes from "../modules/rooms/room.routes";
import reservationRoutes from "../modules/reservations/reservation.route";
import poolRoutes from "../modules/pool/pool.routes";
const router = Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/reservations", reservationRoutes);
router.use("/pool", poolRoutes);
// TODO: add other route modules here

export default router;
