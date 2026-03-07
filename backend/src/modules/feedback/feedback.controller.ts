import { Request, Response, NextFunction } from "express";
import * as feedbackService from "./feedback.service";

export const getAllFeedbacks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedbacks = await feedbackService.getAllFeedbacks();
    res.json({ status: "ok", data: feedbacks });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id as string);
    res.json({ status: "ok", data: feedback });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackByRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rating = parseInt(req.params.rating as string, 10);
    const feedbacks = await feedbackService.getFeedbackByRating(rating);
    res.json({ status: "ok", data: feedbacks });
  } catch (error) {
    next(error);
  }
};

export const getAverageRating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await feedbackService.getAverageRating();
    res.json({ status: "ok", data: result });
  } catch (error) {
    next(error);
  }
};

export const createFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedback = await feedbackService.createFeedback(req.body);
    res.status(201).json({ status: "ok", data: feedback });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await feedbackService.deleteFeedback(req.params.id as string);
    res.json({ status: "ok", message: "Feedback deleted successfully" });
  } catch (error) {
    next(error);
  }
};
