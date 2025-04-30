import { get, post, put, del } from "./index";

const userService = {
  // Get all users with optional filters
  getUsers: async (params = {}) => {
    return await get("/users", params);
  },

  // Get single user by ID
  getUser: async (userId) => {
    return await get(`/users/${userId}`);
  },

  // Create new user
  createUser: async (userData) => {
    return await post("/users", userData);
  },

  // Update user
  updateUser: async (userId, userData) => {
    return await put(`/users/${userId}`, userData);
  },

  // Delete user
  deleteUser: async (userId) => {
    return await del(`/users/${userId}`);
  },

  // Add user address
  addAddress: async (addressData) => {
    return await post("/users/addresses", addressData);
  },

  // Remove user address
  removeAddress: async (addressId) => {
    return await del(`/users/addresses/${addressId}`);
  },
};

export default userService;
