import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import useTheme from "../../hooks/useTheme";

const MainLayout = () => {
  const { sidebarOpen } = useTheme();

  return (
    <div className='h-screen flex overflow-hidden bg-gray-100'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <Header />

        {/* Main content area with scrolling */}
        <main
          className={`flex-1 overflow-y-auto focus:outline-none ${
            sidebarOpen ? "lg:ml-64" : ""
          }`}
        >
          <div className='py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8'>
              {/* Page content */}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
