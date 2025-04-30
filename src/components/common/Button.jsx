import React from "react";
import PropTypes from "prop-types";

/**
 * Reusable Button component with different variants and sizes
 */
const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = "",
  ...rest
}) => {
  // Base button classes
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-colors";

  // Variant classes
  const variantClasses = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    secondary:
      "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2",
    success:
      "bg-success-600 text-white hover:bg-success-700 focus:ring-2 focus:ring-success-500 focus:ring-offset-2",
    danger:
      "bg-danger-600 text-white hover:bg-danger-700 focus:ring-2 focus:ring-danger-500 focus:ring-offset-2",
    warning:
      "bg-warning-600 text-white hover:bg-warning-700 focus:ring-2 focus:ring-warning-500 focus:ring-offset-2",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
    text: "text-primary-600 hover:text-primary-700 hover:bg-primary-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  };

  // Size classes
  const sizeClasses = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-2 text-base",
    xl: "px-6 py-3 text-base",
  };

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";

  // Disabled classes
  const disabledClasses =
    disabled || loading ? "opacity-60 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && (
        <svg
          className='mr-2 h-4 w-4 animate-spin text-white'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          ></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "outline",
    "text",
  ]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
