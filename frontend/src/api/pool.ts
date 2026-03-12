import api from "../lib/axios";

export interface PoolSlot {
  id: string;
  label: "MORNING" | "AFTERNOON";
  startTime: string;
  endTime: string;
  capacity: number;
  price: number;
}

export interface PoolAvailability extends PoolSlot {
  date: string;
  isAvailable: boolean;
  disabledReason: string | null;
}

export const poolApi = {
  getAll: () => api.get<{ data: PoolSlot[] }>("/api/pool"),
  getById: (id: string) => api.get<{ data: PoolSlot }>(`/api/pool/${id}`),
  getAvailability: (date: string) =>
    api.get<{ data: PoolAvailability[] }>(`/api/pool/availability/${date}`),
  create: (data: Omit<PoolSlot, "id">) => api.post("/api/pool", data),
  update: (id: string, data: Partial<PoolSlot>) =>
    api.put(`/api/pool/${id}`, data),
  delete: (id: string) => api.delete(`/api/pool/${id}`),
  disable: (data: { label: string; date: string; reason?: string }) =>
    api.post("/api/pool/disable", data),
  enable: (label: string, date: string) =>
    api.delete(`/api/pool/enable/${label}/${date}`),
};
