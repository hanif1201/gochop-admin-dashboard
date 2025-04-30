import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "./hooks/useAuth";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// User Management
import UserList from "./pages/users/UserList";
import UserDetail from "./pages/users/UserDetail";
import AddUser from "./pages/users/AddUser";
import EditUser from "./pages/users/EditUser";

// Restaurant Management
import RestaurantList from "./pages/restaurants/RestaurantList";
import RestaurantDetail from "./pages/restaurants/RestaurantDetail";
import AddRestaurant from "./pages/restaurants/AddRestaurant";
import EditRestaurant from "./pages/restaurants/EditRestaurant";

// Order Management
import OrderList from "./pages/orders/OrderList";
import OrderDetail from "./pages/orders/OrderDetail";
import OrderAnalytics from "./pages/orders/OrderAnalytics";

// Rider Management
import RiderList from "./pages/riders/RiderList";
import RiderDetail from "./pages/riders/RiderDetail";
import AddRider from "./pages/riders/AddRider";
import EditRider from "./pages/riders/EditRider";

// Menu Management
import MenuList from "./pages/menu/MenuList";
import MenuDetail from "./pages/menu/MenuDetail";
import AddMenuItem from "./pages/menu/AddMenuItem";
import EditMenuItem from "./pages/menu/EditMenuItem";

// Reports
import SalesReport from "./pages/reports/SalesReport";
import UserReport from "./pages/reports/UserReport";
import RestaurantReport from "./pages/reports/RestaurantReport";
import RiderReport from "./pages/reports/RiderReport";

// Settings
import Profile from "./pages/settings/Profile";
import Security from "./pages/settings/Security";
import AppSettings from "./pages/settings/AppSettings";
import Notifications from "./pages/settings/Notifications";

// Route Guards
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

// Not Found Page
import NotFound from "./pages/NotFound";

function App() {
  const { isAuthenticated, loading, user, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary-600'></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path='/login'
          element={!isAuthenticated ? <Login /> : <Navigate to='/dashboard' />}
        />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path='/dashboard' element={<Dashboard />} />

            {/* Admin Only Routes */}
            <Route element={<AdminRoute />}>
              {/* User Management */}
              <Route path='/users' element={<UserList />} />
              <Route path='/users/:id' element={<UserDetail />} />
              <Route path='/users/add' element={<AddUser />} />
              <Route path='/users/edit/:id' element={<EditUser />} />

              {/* Restaurant Management */}
              <Route path='/restaurants' element={<RestaurantList />} />
              <Route path='/restaurants/:id' element={<RestaurantDetail />} />
              <Route path='/restaurants/add' element={<AddRestaurant />} />
              <Route
                path='/restaurants/edit/:id'
                element={<EditRestaurant />}
              />

              {/* Menu Management */}
              <Route path='/menu' element={<MenuList />} />
              <Route path='/menu/:id' element={<MenuDetail />} />
              <Route path='/menu/add' element={<AddMenuItem />} />
              <Route path='/menu/edit/:id' element={<EditMenuItem />} />

              {/* Rider Management */}
              <Route path='/riders' element={<RiderList />} />
              <Route path='/riders/:id' element={<RiderDetail />} />
              <Route path='/riders/add' element={<AddRider />} />
              <Route path='/riders/edit/:id' element={<EditRider />} />
            </Route>

            {/* Order Management */}
            <Route path='/orders' element={<OrderList />} />
            <Route path='/orders/:id' element={<OrderDetail />} />
            <Route path='/orders/analytics' element={<OrderAnalytics />} />

            {/* Reports */}
            <Route path='/reports/sales' element={<SalesReport />} />
            <Route path='/reports/users' element={<UserReport />} />
            <Route path='/reports/restaurants' element={<RestaurantReport />} />
            <Route path='/reports/riders' element={<RiderReport />} />

            {/* Settings */}
            <Route path='/settings/profile' element={<Profile />} />
            <Route path='/settings/security' element={<Security />} />
            <Route path='/settings/app' element={<AppSettings />} />
            <Route path='/settings/notifications' element={<Notifications />} />
          </Route>
        </Route>

        {/* Default Route */}
        <Route path='/' element={<Navigate to='/dashboard' replace />} />

        {/* 404 - Not Found */}
        <Route path='*' element={<NotFound />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
