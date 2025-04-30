import { post, get } from "./index";

const authService = {
  // Login admin user
  login: async (credentials) => {
    return await post("/auth/login", credentials);
  },

  // Logout user
  logout: async () => {
    return await get("/auth/logout");
  },

  // Get current user data
  getCurrentUser: async () => {
    return await get("/auth/me");
  },

  // Request password reset
  forgotPassword: async (email) => {
    return await post("/auth/forgotpassword", { email });
  },

  // Reset password with token
  resetPassword: async (token, password) => {
    return await post(`/auth/resetpassword/${token}`, { password });
  },

  // Update user details
  updateUserDetails: async (data) => {
    return await post("/auth/updatedetails", data);
  },

  // Update password
  updatePassword: async (passwordData) => {
    return await post("/auth/updatepassword", passwordData);
  },
};

export default authService;
