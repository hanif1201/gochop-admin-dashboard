import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUtensils,
  FaShoppingBag,
  FaMotorcycle,
  FaListAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaAngleDown,
  FaAngleRight,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";
import { useState } from "react";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useTheme();

  // State for collapsible menu sections
  const [openMenus, setOpenMenus] = useState({
    reports: false,
    settings: false,
  });

  // Function to toggle menu sections
  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Sidebar menu items
  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <FaHome className='mr-3 h-5 w-5' />,
      allowedRoles: ["admin", "restaurant", "rider"],
    },
    {
      title: "Users",
      path: "/users",
      icon: <FaUsers className='mr-3 h-5 w-5' />,
      allowedRoles: ["admin"],
    },
    {
      title: "Restaurants",
      path: "/restaurants",
      icon: <FaUtensils className='mr-3 h-5 w-5' />,
      allowedRoles: ["admin"],
    },
    {
      title: "Orders",
      path: "/orders",
      icon: <FaShoppingBag className='mr-3 h-5 w-5' />,
      allowedRoles: ["admin", "restaurant", "rider"],
    },
    {
      title: "Riders",
      path: "/riders",
      icon: <FaMotorcycle className='mr-3 h-5 w-5' />,
      allowedRoles: ["admin"],
    },
    {
      title: "Menu Items",
      path: "/menu",
      icon: <FaListAlt className='mr-3 h-5 w-5' />,
      allowedRoles: ["admin", "restaurant"],
    },
    {
      title: "Reports",
      icon: <FaChartBar className='mr-3 h-5 w-5' />,
      allowedRoles: ["admin", "restaurant"],
      submenu: true,
      submenuItems: [
        {
          title: "Sales Report",
          path: "/reports/sales",
        },
        {
          title: "User Report",
          path: "/reports/users",
          allowedRoles: ["admin"],
        },
        {
          title: "Restaurant Report",
          path: "/reports/restaurants",
          allowedRoles: ["admin"],
        },
        {
          title: "Rider Report",
          path: "/reports/riders",
          allowedRoles: ["admin"],
        },
      ],
    },
    {
      title: "Settings",
      icon: <FaCog className='mr-3 h-5 w-5' />,
      allowedRoles: ["admin", "restaurant", "rider"],
      submenu: true,
      submenuItems: [
        {
          title: "Profile",
          path: "/settings/profile",
        },
        {
          title: "Security",
          path: "/settings/security",
        },
        {
          title: "App Settings",
          path: "/settings/app",
          allowedRoles: ["admin"],
        },
        {
          title: "Notifications",
          path: "/settings/notifications",
        },
      ],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    return item.allowedRoles?.includes(user?.role);
  });

  // Mobile sidebar toggle
  const handleSidebarToggle = () => {
    toggleSidebar();
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden'
          onClick={handleSidebarToggle}
        ></div>
      )}

      {/* Mobile toggle button */}
      <div className='fixed top-4 left-4 z-30 lg:hidden'>
        <button
          onClick={handleSidebarToggle}
          className='p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none'
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } lg:static lg:inset-0`}
      >
        {/* Logo */}
        <div className='flex items-center justify-between px-4 py-5 bg-gray-900'>
          <div className='flex items-center space-x-2'>
            <div className='h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center'>
              <span className='font-bold text-white'>GC</span>
            </div>
            <span className='text-xl font-bold'>GoChop Admin</span>
          </div>
          <button
            onClick={handleSidebarToggle}
            className='p-2 rounded-md text-gray-500 hover:text-white lg:hidden'
          >
            <FaTimes />
          </button>
        </div>

        {/* User info */}
        <div className='px-4 py-3 border-b border-gray-700'>
          <div className='flex items-center'>
            <div className='h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold'>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium'>{user?.name || "User"}</p>
              <p className='text-xs text-gray-400'>
                {user?.role?.toUpperCase() || "Role"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className='px-2 py-4 space-y-1'>
          {filteredMenuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title.toLowerCase())}
                    className='flex items-center w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md'
                  >
                    {item.icon}
                    <span className='flex-1'>{item.title}</span>
                    {openMenus[item.title.toLowerCase()] ? (
                      <FaAngleDown className='h-4 w-4' />
                    ) : (
                      <FaAngleRight className='h-4 w-4' />
                    )}
                  </button>

                  {openMenus[item.title.toLowerCase()] && (
                    <div className='pl-10 mt-1 space-y-1'>
                      {item.submenuItems.map(
                        (subItem, subIndex) =>
                          (!subItem.allowedRoles ||
                            subItem.allowedRoles.includes(user?.role)) && (
                            <NavLink
                              key={subIndex}
                              to={subItem.path}
                              className={({ isActive }) =>
                                `block px-3 py-2 text-sm rounded-md ${
                                  isActive
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`
                              }
                            >
                              {subItem.title}
                            </NavLink>
                          )
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.title}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Logout button */}
        <div className='absolute bottom-0 w-full p-4 border-t border-gray-700'>
          <button
            onClick={logout}
            className='flex items-center w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md'
          >
            <FaSignOutAlt className='mr-3 h-5 w-5' />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
