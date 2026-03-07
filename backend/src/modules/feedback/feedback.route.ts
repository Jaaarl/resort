import { Router } from "express";
import * as feedbackController from "./feedback.controller";
import { validate } from "../../middleware/validate";
import { createFeedbackSchema } from "./feedback.schema";

const router = Router();

router.get("/", feedbackController.getAllFeedbacks);
router.get("/average", feedbackController.getAverageRating);
router.get("/rating/:rating", feedbackController.getFeedbackByRating);
router.get("/:id", feedbackController.getFeedbackById);
router.post("/", validate(createFeedbackSchema), feedbackController.createFeedback);
router.delete("/:id", feedbackController.deleteFeedback);

export default router;
