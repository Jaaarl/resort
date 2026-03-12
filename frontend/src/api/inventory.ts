import api from "../lib/axios";

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  type: "SHOP" | "MAINTENANCE";
  quantity: number;
  unit: string;
  lowStockAlert: number;
  price?: number;
  isActive: boolean;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason?: string;
  reasonType?: "SOLD" | "EXPIRED" | "DAMAGED" | "USED" | "ADJUSTMENT";
  createdById: string;
  createdAt: string;
  createdBy: { name: string };
  item: { name: string };
}

export const inventoryApi = {
  getAll: (type?: string) =>
    api.get<{ data: InventoryItem[] }>(
      `/api/inventory${type ? `?type=${type}` : ""}`,
    ),
  getById: (id: string) =>
    api.get<{ data: InventoryItem }>(`/api/inventory/${id}`),
  getLowStock: () =>
    api.get<{ data: InventoryItem[] }>("/api/inventory/low-stock"),
  getMovements: () =>
    api.get<{ data: InventoryMovement[] }>("/api/inventory/movements"),
  getItemMovements: (id: string) =>
    api.get<{ data: InventoryMovement[] }>(`/api/inventory/${id}/movements`),
  create: (data: any) => api.post("/api/inventory", data),
  update: (id: string, data: any) => api.put(`/api/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/api/inventory/${id}`),
  restore: (id: string) => api.patch(`/api/inventory/${id}/restore`),
  recordMovement: (data: any) => api.post("/api/inventory/movements", data),
};
