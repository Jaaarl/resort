import { Router } from "express";
import * as feedbackController from "./feedback.controller";
import { validate } from "../../middleware/validate";
import { createFeedbackSchema } from "./feedback.schema";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, feedbackController.getAllFeedbacks);
router.get("/average", authenticate, feedbackController.getAverageRating);
router.get(
  "/rating/:rating",
  authenticate,
  feedbackController.getFeedbackByRating,
);
router.get("/:id", authenticate, feedbackController.getFeedbackById);
router.post("/", feedbackController.createFeedback); // public
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  feedbackController.deleteFeedback,
);

export default router;
