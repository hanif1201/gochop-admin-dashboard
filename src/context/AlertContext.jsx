import React, { createContext, useCallback } from "react";
import { toast } from "react-toastify";

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  // Success notification
  const success = useCallback((message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  // Error notification
  const error = useCallback((message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  // Warning notification
  const warning = useCallback((message) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  // Info notification
  const info = useCallback((message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  return (
    <AlertContext.Provider
      value={{
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
