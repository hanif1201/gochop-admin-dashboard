import React from "react";
import PropTypes from "prop-types";

/**
 * Card component for containing content in a box with optional header and footer
 */
const Card = ({
  children,
  title,
  subtitle,
  footer,
  noPadding = false,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  ...rest
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow overflow-hidden ${className}`}
      {...rest}
    >
      {(title || subtitle) && (
        <div
          className={`px-4 py-5 border-b border-gray-200 sm:px-6 ${headerClassName}`}
        >
          {title && (
            <h3 className='text-lg leading-6 font-medium text-gray-900'>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className='mt-1 max-w-2xl text-sm text-gray-500'>{subtitle}</p>
          )}
        </div>
      )}

      <div
        className={`${noPadding ? "" : "px-4 py-5 sm:p-6"} ${bodyClassName}`}
      >
        {children}
      </div>

      {footer && (
        <div
          className={`px-4 py-4 border-t border-gray-200 sm:px-6 ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  footer: PropTypes.node,
  noPadding: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
};

export default Card;
