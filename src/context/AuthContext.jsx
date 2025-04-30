import React, { createContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../api/auth";
import { removeToken, setToken, getToken } from "../utils/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return false;
      }

      // Fetch current user data
      const response = await authService.getCurrentUser();

      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        return true;
      } else {
        removeToken();
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error("Auth check error:", err);
      removeToken();
      setIsAuthenticated(false);
      setUser(null);
      setError(err.message || "Authentication failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Run auth check on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        setError(null);
        return response;
      } else {
        throw new Error(response.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if logout fails on server, remove token locally
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        checkAuth,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
