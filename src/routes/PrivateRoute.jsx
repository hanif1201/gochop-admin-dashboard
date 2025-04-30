import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * PrivateRoute component that checks if user is authenticated
 * If authenticated, renders the child routes
 * If not authenticated, redirects to login page
 */
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary-600'></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default PrivateRoute;
