import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * AdminRoute component that checks if user is authenticated and has admin role
 * If admin, renders the child routes
 * If not admin, redirects to dashboard
 */
const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary-600'></div>
      </div>
    );
  }

  // Redirect to dashboard if not authenticated or not an admin
  if (!isAuthenticated || (user && user.role !== "admin")) {
    return <Navigate to='/dashboard' replace />;
  }

  // Render child routes if authenticated and has admin role
  return <Outlet />;
};

export default AdminRoute;
