import api from "../lib/axios";

export interface MaintenanceTask {
  id: string;
  title: string;
  description?: string;
  frequency: "DAILY" | "MONTHLY" | "ONCE";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  completedAt?: string;
  remarks?: string;
  photoUrl?: string;
  assignedToId: string;
  createdById: string;
  assignedTo: { id: string; name: string };
  createdBy: { id: string; name: string };
  createdAt: string;
}

export const maintenanceApi = {
  getAll: () => api.get<{ data: MaintenanceTask[] }>("/api/maintenance"),
  getById: (id: string) =>
    api.get<{ data: MaintenanceTask }>(`/api/maintenance/${id}`),
  create: (data: any) => api.post("/api/maintenance", data),
  update: (id: string, data: any) => api.put(`/api/maintenance/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/maintenance/${id}/status`, { status }),
  complete: (id: string, data: { remarks?: string; photoUrl?: string }) =>
    api.patch(`/api/maintenance/${id}/complete`, data),
  delete: (id: string) => api.delete(`/api/maintenance/${id}`),
  getMyTasks: (userId: string) =>
    api.get<{ data: MaintenanceTask[] }>(`/api/maintenance/user/${userId}`),
};
