import api from "../lib/axios";

export interface Room {
  id: string;
  name: string;
  description?: string;
  price: number;
  capacity: number;
  isActive: boolean;
}

export const roomsApi = {
  getAll: () => api.get<{ data: Room[] }>("/api/rooms"),
  getById: (id: string) => api.get<{ data: Room }>(`/api/rooms/${id}`),
  create: (data: Omit<Room, "id" | "isActive">) => api.post("/api/rooms", data),
  update: (id: string, data: Partial<Room>) =>
    api.put(`/api/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/api/rooms/${id}`),
  getAvailability: (checkIn: string, checkOut: string) =>
    api.get<{ data: (Room & { isAvailable: boolean })[] }>(
      `/api/rooms/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
    ),
};
