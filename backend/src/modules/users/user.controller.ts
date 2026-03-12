import { Request, Response, NextFunction } from "express";
import prisma from "../../lib/prisma";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json({ status: "ok", data: users });
  } catch (error) {
    next(error);
  }
};
