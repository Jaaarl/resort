import { Router } from "express";
import authRoutes from "../module/auth/auth";

const router = Router();

router.use("/auth", authRoutes);

// TODO: add other route modules here

export default router;
