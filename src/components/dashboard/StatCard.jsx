import React from "react";
import PropTypes from "prop-types";

/**
 * StatCard component for displaying statistics on dashboard
 */
const StatCard = ({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  loading = false,
  onClick = null,
}) => {
  // Change type determines the color of the change indicator
  const changeTypeColors = {
    increase: "text-green-600",
    decrease: "text-red-600",
    neutral: "text-gray-600",
  };

  // Determine whether the card is clickable
  const isClickable = onClick !== null;

  if (loading) {
    return (
      <div className='bg-white overflow-hidden shadow rounded-lg'>
        <div className='p-5'>
          <div className='animate-pulse flex justify-between'>
            <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
            <div className='h-6 w-6 bg-gray-200 rounded-full'></div>
          </div>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-2/3'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white overflow-hidden shadow rounded-lg ${
        isClickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className='p-5'>
        <div className='flex items-center justify-between'>
          <div className='truncate'>
            <div className='text-sm font-medium text-gray-500 truncate'>
              {title}
            </div>
            <div className='mt-1 text-xl font-semibold text-gray-900'>
              {value}
            </div>
          </div>
          <div className='flex-shrink-0 text-primary-500'>{icon}</div>
        </div>

        {change !== undefined && (
          <div className='mt-4'>
            <div
              className={`flex items-center text-sm ${changeTypeColors[changeType]}`}
            >
              {changeType === "increase" && (
                <svg
                  className='flex-shrink-0 mr-1.5 h-4 w-4 text-green-500'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
              {changeType === "decrease" && (
                <svg
                  className='flex-shrink-0 mr-1.5 h-4 w-4 text-red-500'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
              <span className='mr-1'>{change}</span>
              <span className='text-gray-500'>from previous period</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(["increase", "decrease", "neutral"]),
  loading: PropTypes.bool,
  onClick: PropTypes.func,
};

export default StatCard;
