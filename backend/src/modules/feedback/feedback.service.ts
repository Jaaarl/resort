import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import { CreateFeedbackInput } from "./feedback.schema";

export const getAllFeedbacks = async () => {
  return await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getFeedbackById = async (id: string) => {
  const feedback = await prisma.feedback.findUnique({
    where: { id },
  });

  if (!feedback) throw new AppError("Feedback not found", 404);

  return feedback;
};

export const getFeedbackByRating = async (rating: number) => {
  return await prisma.feedback.findMany({
    where: { rating },
    orderBy: { createdAt: "desc" },
  });
};

export const getAverageRating = async () => {
  const result = await prisma.feedback.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    averageRating: result._avg.rating ?? 0,
    totalFeedbacks: result._count.rating,
  };
};

export const createFeedback = async (data: CreateFeedbackInput) => {
  return await prisma.feedback.create({
    data: {
      rating: data.rating,
      comment: data.comment,
      isAnonymous: data.isAnonymous,
      customerName: data.isAnonymous ? null : data.customerName,
      customerEmail: data.isAnonymous ? null : data.customerEmail,
      customerPhone: data.isAnonymous ? null : data.customerPhone,
    },
  });
};

export const deleteFeedback = async (id: string) => {
  await getFeedbackById(id);

  return await prisma.feedback.delete({
    where: { id },
  });
};
