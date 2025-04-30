import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaSearch,
  FaBars,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, toggleSidebar } = useTheme();

  // Dropdown states
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Refs for dropdown handling
  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }

      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sample notifications for demonstration
  const notifications = [
    {
      id: 1,
      message: "New order received",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      message: "Restaurant Tasty Bites just joined",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "New rider application needs approval",
      time: "3 hours ago",
      read: true,
    },
  ];

  return (
    <header className='bg-white shadow-sm z-10'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Left section - Mobile menu button and search */}
          <div className='flex items-center'>
            {/* Mobile menu button - visible on desktop too but handled differently */}
            <button
              onClick={toggleSidebar}
              className='text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden'
            >
              <FaBars className='h-5 w-5' />
            </button>

            {/* Search bar */}
            <div className='max-w-lg w-full lg:max-w-xs ml-4'>
              <label htmlFor='search' className='sr-only'>
                Search
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaSearch className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='search'
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  placeholder='Search'
                  type='search'
                />
              </div>
            </div>
          </div>

          {/* Right section - User profile, notifications, settings */}
          <div className='flex items-center space-x-4'>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className='p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none'
            >
              {theme === "dark" ? (
                <FaSun className='h-5 w-5' />
              ) : (
                <FaMoon className='h-5 w-5' />
              )}
            </button>

            {/* Notifications dropdown */}
            <div className='relative' ref={notificationDropdownRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className='p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none relative'
              >
                <FaBell className='h-5 w-5' />
                {notifications.some((n) => !n.read) && (
                  <span className='absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500'></span>
                )}
              </button>

              {/* Notifications panel */}
              {notificationsOpen && (
                <div className='origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
                  <div className='px-4 py-2 border-b border-gray-200'>
                    <h3 className='text-sm font-medium text-gray-900'>
                      Notifications
                    </h3>
                  </div>

                  <div className='max-h-60 overflow-y-auto'>
                    {notifications.length > 0 ? (
                      <div className='divide-y divide-gray-200'>
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <p className='text-sm text-gray-900'>
                              {notification.message}
                            </p>
                            <p className='text-xs text-gray-500 mt-1'>
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='px-4 py-3 text-center text-gray-500 text-sm'>
                        No new notifications
                      </div>
                    )}
                  </div>

                  <div className='border-t border-gray-200'>
                    <Link
                      to='/notifications'
                      className='block px-4 py-2 text-sm text-center text-primary-600 hover:text-primary-900'
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className='relative' ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className='flex text-sm rounded-full focus:outline-none'
              >
                <div className='h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600'>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </button>

              {/* User dropdown panel */}
              {userDropdownOpen && (
                <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
                  <div className='px-4 py-2 border-b border-gray-200'>
                    <p className='text-sm font-medium text-gray-900'>
                      {user?.name || "User"}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {user?.email || "user@example.com"}
                    </p>
                  </div>

                  <Link
                    to='/settings/profile'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left'
                  >
                    <FaUser className='inline-block mr-2 h-4 w-4' />
                    Profile
                  </Link>

                  <Link
                    to='/settings/security'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left'
                  >
                    <FaCog className='inline-block mr-2 h-4 w-4' />
                    Settings
                  </Link>

                  <button
                    onClick={logout}
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left'
                  >
                    <FaSignOutAlt className='inline-block mr-2 h-4 w-4' />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
