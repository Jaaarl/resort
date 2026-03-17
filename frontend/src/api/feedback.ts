import api from "../lib/axios";

export interface Feedback {
  id: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
}

export const feedbackApi = {
  getAll: () => api.get<{ data: Feedback[] }>("/api/feedback"),
  getAverage: () =>
    api.get<{ data: { averageRating: number; totalFeedbacks: number } }>(
      "/api/feedback/average",
    ),
  getByRating: (rating: number) =>
    api.get<{ data: Feedback[] }>(`/api/feedback/rating/${rating}`),
  delete: (id: string) => api.delete(`/api/feedback/${id}`),
  create: (data: CreateFeedbackInput) =>
    api.post<{ data: Feedback }>("/api/feedback", data),
};
