import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has saved theme preference in localStorage
  const getSavedTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }

    // If no saved preference, check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(getSavedTheme());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Update theme class on document and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Save sidebar state in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen.toString());
  }, [sidebarOpen]);

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
