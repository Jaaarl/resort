import { Router } from "express";
import authRoutes from "../modules/auth/auth";
import roomRoutes from "../modules/rooms/room.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);

// TODO: add other route modules here

export default router;
