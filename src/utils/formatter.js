/**
 * Format a date to a readable string
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "";

  // Default options
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  // Merge options
  const formatterOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat("en-US", formatterOptions).format(date);
};

/**
 * Format date without time
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string (e.g., "Apr 15, 2023")
 */
export const formatDateOnly = (dateString) => {
  return formatDate(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: undefined,
    minute: undefined,
  });
};

/**
 * Format time only
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted time string (e.g., "2:30 PM")
 */
export const formatTimeOnly = (dateString) => {
  return formatDate(dateString, {
    year: undefined,
    month: undefined,
    day: undefined,
  });
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "USD") => {
  if (amount === undefined || amount === null) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimalPlaces = 2) => {
  if (value === undefined || value === null) return "";

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value / 100);
};

/**
 * Format phone number to (XXX) XXX-XXXX format
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Check if it's a valid US/Canada phone number (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // Return original format if not a standard 10-digit number
  return phoneNumber;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return "";
  if (text.length <= length) return text;

  return text.substring(0, length) + "...";
};

/**
 * Format order status for display
 * @param {string} status - Order status value
 * @returns {string} Formatted status text
 */
export const formatOrderStatus = (status) => {
  if (!status) return "";

  // Replace underscores with spaces and capitalize words
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (up to 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return "";

  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

/**
 * Format a distance in kilometers
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return "";

  if (distance < 1) {
    // Convert to meters
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  }

  return `${distance.toFixed(1)} km`;
};

/**
 * Format a number with commas for thousands
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return "";

  return new Intl.NumberFormat("en-US").format(number);
};

/**
 * Format a file size in bytes to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  if (!bytes) return "";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format a duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "1h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};
