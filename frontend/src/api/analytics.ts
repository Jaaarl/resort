import api from "../lib/axios";

export const analyticsApi = {
  getRoomOccupancy: (startDate: string, endDate: string) =>
    api.get(
      `/api/analytics/occupancy/rooms?startDate=${startDate}&endDate=${endDate}`,
    ),
  getPoolOccupancy: (startDate: string, endDate: string) =>
    api.get(
      `/api/analytics/occupancy/pool?startDate=${startDate}&endDate=${endDate}`,
    ),
  getRevenue: (period: string, date: string) =>
    api.get(`/api/analytics/revenue?period=${period}&date=${date}`),
  getWalkInVsReserved: (startDate: string, endDate: string) =>
    api.get(
      `/api/analytics/walkin-vs-reserved?startDate=${startDate}&endDate=${endDate}`,
    ),
  getShopSales: (period: string, date: string) =>
    api.get(`/api/analytics/shop-sales?period=${period}&date=${date}`),
};
