import { get, post, put } from "./index";

const orderService = {
  // Get all orders with optional filters
  getOrders: async (params = {}) => {
    return await get("/orders", params);
  },

  // Get orders for current user (restaurant or rider)
  getMyOrders: async (params = {}) => {
    return await get("/orders/myorders", params);
  },

  // Get single order by ID
  getOrder: async (orderId) => {
    return await get(`/orders/${orderId}`);
  },

  // Create new order (customer only)
  createOrder: async (orderData) => {
    return await post("/orders", orderData);
  },

  // Update order status
  updateOrderStatus: async (orderId, statusData) => {
    return await put(`/orders/${orderId}/status`, statusData);
  },

  // Rate an order (customer only)
  rateOrder: async (orderId, ratingData) => {
    return await post(`/orders/${orderId}/rate`, ratingData);
  },

  // Get order analytics (admin or restaurant)
  getOrderAnalytics: async (params = {}) => {
    return await get("/admin/orders/stats", params);
  },
};

export default orderService;
