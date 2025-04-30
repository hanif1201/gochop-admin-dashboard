// Token storage key
const TOKEN_KEY = "gochop_admin_token";

/**
 * Store authentication token in localStorage
 * @param {string} token - JWT token string
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieve authentication token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user has valid token
 * @returns {boolean} True if token exists
 */
export const hasToken = () => {
  return !!getToken();
};

/**
 * Parse JWT token to get payload
 * @param {string} token - JWT token string
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const parseToken = (token) => {
  if (!token) return null;

  try {
    // Extract payload part (second segment) of JWT
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  const payload = parseToken(token);
  if (!payload) return true;

  // Token expiration is stored in 'exp' claim as Unix timestamp (seconds)
  const expirationDate = new Date(payload.exp * 1000);
  const currentDate = new Date();

  return currentDate > expirationDate;
};

/**
 * Check if current token is valid and not expired
 * @returns {boolean} True if valid token exists and is not expired
 */
export const hasValidToken = () => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
};

/**
 * Get user information from token
 * @returns {object|null} User data from token or null if no valid token
 */
export const getUserFromToken = () => {
  const token = getToken();
  if (!token || isTokenExpired(token)) return null;

  const payload = parseToken(token);
  return payload ? { id: payload.id, role: payload.role } : null;
};
