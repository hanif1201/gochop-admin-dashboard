import { get, post, put, del, uploadFile } from "./index";

const menuService = {
  // Get all menu items with optional filters
  getMenuItems: async (restaurantId = null, params = {}) => {
    if (restaurantId) {
      params.restaurant = restaurantId;
    }
    return await get("/menu", params);
  },

  // Get single menu item by ID
  getMenuItem: async (menuItemId) => {
    return await get(`/menu/${menuItemId}`);
  },

  // Create new menu item
  createMenuItem: async (menuItemData) => {
    // Handle FormData for file uploads
    if (menuItemData instanceof FormData) {
      return await uploadFile("/menu", menuItemData);
    }
    return await post("/menu", menuItemData);
  },

  // Update menu item
  updateMenuItem: async (menuItemId, menuItemData) => {
    // Handle FormData for file uploads
    if (menuItemData instanceof FormData) {
      return await uploadFile(`/menu/${menuItemId}`, menuItemData);
    }
    return await put(`/menu/${menuItemId}`, menuItemData);
  },

  // Delete menu item
  deleteMenuItem: async (menuItemId) => {
    return await del(`/menu/${menuItemId}`);
  },

  // Toggle menu item availability
  toggleAvailability: async (menuItemId) => {
    return await put(`/menu/${menuItemId}/toggle-availability`);
  },

  // Upload menu item image
  uploadImage: async (menuItemId, file) => {
    const formData = new FormData();
    formData.append("image", file);

    return await uploadFile(`/menu/${menuItemId}/upload`, formData);
  },
};

export default menuService;
