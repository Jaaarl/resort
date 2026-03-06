import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/error";
import {
  CreateMaintenanceTaskInput,
  UpdateMaintenanceTaskInput,
  CompleteMaintenanceTaskInput,
  UpdateTaskStatusInput,
} from "./maintenance.schema";

export const getAllTasks = async () => {
  return await prisma.maintenanceTask.findMany({
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          // password excluded
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
};

export const getTaskById = async (id: string) => {
  const task = await prisma.maintenanceTask.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          // password excluded
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!task) throw new AppError("Maintenance task not found", 404);

  return task;
};

export const getTasksByAssignedUser = async (userId: string) => {
  return await prisma.maintenanceTask.findMany({
    where: { assignedToId: userId },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          // password excluded
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
};

export const getTasksByFrequency = async (frequency: "DAILY" | "MONTHLY") => {
  return await prisma.maintenanceTask.findMany({
    where: { frequency },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          // password excluded
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
};

export const createTask = async (data: CreateMaintenanceTaskInput) => {
  // verify assigned user exists
  const assignedUser = await prisma.user.findUnique({
    where: { id: data.assignedToId },
  });

  if (!assignedUser) throw new AppError("Assigned user not found", 404);

  return await prisma.maintenanceTask.create({
    data: {
      title: data.title,
      description: data.description,
      frequency: data.frequency,
      dueDate: new Date(data.dueDate),
      assignedToId: data.assignedToId,
      createdById: data.createdById,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          // password excluded
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });
};

export const updateTask = async (
  id: string,
  data: UpdateMaintenanceTaskInput,
) => {
  await getTaskById(id);

  return await prisma.maintenanceTask.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.frequency && { frequency: data.frequency }),
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      ...(data.assignedToId && { assignedToId: data.assignedToId }),
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          // password excluded
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });
};

export const updateTaskStatus = async (
  id: string,
  data: UpdateTaskStatusInput,
) => {
  await getTaskById(id);

  return await prisma.maintenanceTask.update({
    where: { id },
    data: { status: data.status },
  });
};

export const completeTask = async (
  id: string,
  data: CompleteMaintenanceTaskInput,
) => {
  const task = await getTaskById(id);

  if (task.status === "COMPLETED") {
    throw new AppError("Task is already completed", 400);
  }

  return await prisma.maintenanceTask.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      remarks: data.remarks,
      photoUrl: data.photoUrl,
    },
  });
};

export const deleteTask = async (id: string) => {
  await getTaskById(id);

  return await prisma.maintenanceTask.delete({
    where: { id },
  });
};
