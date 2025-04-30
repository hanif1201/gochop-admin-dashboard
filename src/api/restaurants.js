import { get, post, put, del, uploadFile } from "./index";

const restaurantService = {
  // Get all restaurants with optional filters
  getRestaurants: async (params = {}) => {
    return await get("/restaurants", params);
  },

  // Get single restaurant by ID
  getRestaurant: async (restaurantId) => {
    return await get(`/restaurants/${restaurantId}`);
  },

  // Create new restaurant
  createRestaurant: async (restaurantData) => {
    return await post("/restaurants", restaurantData);
  },

  // Update restaurant
  updateRestaurant: async (restaurantId, restaurantData) => {
    return await put(`/restaurants/${restaurantId}`, restaurantData);
  },

  // Delete restaurant
  deleteRestaurant: async (restaurantId) => {
    return await del(`/restaurants/${restaurantId}`);
  },

  // Toggle restaurant status (open/closed)
  toggleStatus: async (restaurantId) => {
    return await put(`/restaurants/${restaurantId}/toggle-status`);
  },

  // Get restaurant menu
  getRestaurantMenu: async (restaurantId) => {
    return await get(`/restaurants/${restaurantId}/menu`);
  },

  // Get restaurant analytics
  getAnalytics: async (restaurantId, period = "month") => {
    return await get(`/restaurants/${restaurantId}/analytics`, { period });
  },

  // Upload restaurant image (logo or cover)
  uploadImage: async (restaurantId, type, file) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type); // 'logo' or 'cover'

    return await uploadFile(`/restaurants/${restaurantId}/upload`, formData);
  },
};

export default restaurantService;
