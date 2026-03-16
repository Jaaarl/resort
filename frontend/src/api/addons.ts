import api from "../lib/axios";

export interface AddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  isActive: boolean;
}

export interface ReservationAddOn {
  addOnId: string;
  quantity: number;
  price: number;
  addOn: { name: string };
}

export const addonsApi = {
  getAll: () => api.get<{ data: AddOn[] }>("/api/addons"),
  getById: (id: string) => api.get<{ data: AddOn }>(`/api/addons/${id}`),
  getAvailability: (id: string, date: string) =>
    api.get<{ data: { available: number } }>(
      `/api/addons/${id}/availability?date=${date}`,
    ),
  create: (data: any) => api.post("/api/addons", data),
  update: (id: string, data: any) => api.put(`/api/addons/${id}`, data),
  delete: (id: string) => api.delete(`/api/addons/${id}`),
  addToReservation: (
    reservationId: string,
    addOns: { addOnId: string; quantity: number }[],
  ) => api.post(`/api/reservations/${reservationId}/addons`, { addOns }),
};
