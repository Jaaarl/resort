import { z } from "zod";

export const createMaintenanceTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.enum(["DAILY", "MONTHLY"]),
  dueDate: z.string().datetime(),
  assignedToId: z.string().min(1, "Assigned user is required"),
  createdById: z.string().min(1, "Creator is required"),
});

export const updateMaintenanceTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  frequency: z.enum(["DAILY", "MONTHLY"]).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
});

export const completeMaintenanceTaskSchema = z.object({
  remarks: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});

export type CreateMaintenanceTaskInput = z.infer<
  typeof createMaintenanceTaskSchema
>;
export type UpdateMaintenanceTaskInput = z.infer<
  typeof updateMaintenanceTaskSchema
>;
export type CompleteMaintenanceTaskInput = z.infer<
  typeof completeMaintenanceTaskSchema
>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
