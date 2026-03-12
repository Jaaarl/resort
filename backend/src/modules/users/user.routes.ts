import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as userController from "./user.controller";

const router = Router();

router.get("/", authenticate, userController.getAllUsers);

export default router;
