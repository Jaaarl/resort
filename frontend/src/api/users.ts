import api from "../lib/axios";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const usersApi = {
  getAll: () => api.get<{ data: User[] }>("/api/users"),
};
