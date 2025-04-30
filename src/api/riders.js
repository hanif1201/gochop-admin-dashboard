import { get, post, put, del, uploadFile } from "./index";

const riderService = {
  // Get all riders with optional filters
  getRiders: async (params = {}) => {
    return await get("/riders", params);
  },

  // Get single rider by ID
  getRider: async (riderId) => {
    return await get(`/riders/${riderId}`);
  },

  // Get current rider profile
  getMyProfile: async () => {
    return await get("/riders/me");
  },

  // Create new rider
  createRider: async (riderData) => {
    return await post("/riders", riderData);
  },

  // Update rider
  updateRider: async (riderId, riderData) => {
    return await put(`/riders/${riderId}`, riderData);
  },

  // Delete rider
  deleteRider: async (riderId) => {
    return await del(`/riders/${riderId}`);
  },

  // Update rider availability status
  updateStatus: async (statusData) => {
    return await put("/riders/status", statusData);
  },

  // Update rider location
  updateLocation: async (locationData) => {
    return await put("/riders/location", locationData);
  },

  // Get rider earnings
  getEarnings: async (params = {}) => {
    return await get("/riders/earnings", params);
  },

  // Upload rider document
  uploadDocument: async (riderId, documentType, file) => {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", documentType);

    return await uploadFile(`/riders/${riderId}/documents`, formData);
  },
};

export default riderService;
