import { get } from "./index";

const dashboardService = {
  // Get overall dashboard statistics
  getDashboardStats: async () => {
    return await get("/admin/stats");
  },

  // Get revenue statistics
  getRevenueStats: async (params) => {
    return await get("/admin/revenue", params);
  },

  // Get user statistics
  getUserStats: async () => {
    return await get("/admin/users/stats");
  },

  // Get restaurant statistics
  getRestaurantStats: async () => {
    return await get("/admin/restaurants/stats");
  },

  // Get order statistics
  getOrderStats: async (params) => {
    return await get("/admin/orders/stats", params);
  },

  // Get rider statistics
  getRiderStats: async () => {
    return await get("/admin/riders/stats");
  },
};

export default dashboardService;
