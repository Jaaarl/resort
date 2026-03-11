import api from "../lib/axios";

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerLocation?: string;
  type: "ROOM" | "POOL" | "BOTH";
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPerson: number;
  totalAmount: number;
  isWalkIn: boolean;
  createdAt: string;
  rooms: {
    roomId: string;
    room: { name: string };
    checkIn: string;
    checkOut: string;
  }[];
  poolSlots: {
    poolSlotId: string;
    poolSlot: { label: string };
    poolDate: string;
  }[];
  addOns: {
    addOnId: string;
    addOn: { name: string };
    quantity: number;
    price: number;
  }[];
}

export const reservationsApi = {
  getAll: () => api.get<{ data: Reservation[] }>("/api/reservations"),
  getById: (id: string) =>
    api.get<{ data: Reservation }>(`/api/reservations/${id}`),
  create: (data: any) => api.post("/api/reservations", data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/reservations/${id}/status`, { status }),
  cancel: (id: string) => api.patch(`/api/reservations/${id}/cancel`),
};
