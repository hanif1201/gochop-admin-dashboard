import axios from "axios";
import { getToken, removeToken } from "../utils/auth";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors - token expired or invalid
    if (error.response && error.response.status === 401) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper function to standardize API responses
const formatResponse = (response) => {
  return {
    success: true,
    data: response.data.data || response.data,
    message: response.data.message,
    ...response.data,
  };
};

// Helper function to standardize API errors
const formatError = (error) => {
  const errorMessage =
    error.response?.data?.message ||
    error.message ||
    "An unexpected error occurred";

  return {
    success: false,
    error: errorMessage,
    message: errorMessage,
    status: error.response?.status,
  };
};

// Generic GET request
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return formatResponse(response);
  } catch (error) {
    return formatError(error);
  }
};

// Generic POST request
export const post = async (url, data = {}) => {
  try {
    const response = await api.post(url, data);
    return formatResponse(response);
  } catch (error) {
    return formatError(error);
  }
};

// Generic PUT request
export const put = async (url, data = {}) => {
  try {
    const response = await api.put(url, data);
    return formatResponse(response);
  } catch (error) {
    return formatError(error);
  }
};

// Generic DELETE request
export const del = async (url) => {
  try {
    const response = await api.delete(url);
    return formatResponse(response);
  } catch (error) {
    return formatError(error);
  }
};

// Generic file upload POST request
export const uploadFile = async (url, formData) => {
  try {
    const token = getToken();

    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return formatResponse(response);
  } catch (error) {
    return formatError(error);
  }
};

export default api;
