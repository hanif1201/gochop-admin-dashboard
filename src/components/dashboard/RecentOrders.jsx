import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import Card from "../common/Card";
import Button from "../common/Button";
import { formatDate, formatCurrency } from "../../utils/formatter";

/**
 * RecentOrders component for displaying a list of recent orders
 */
const RecentOrders = ({ orders, loading = false }) => {
  // Function to get status badge color
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      preparing: "bg-indigo-100 text-indigo-800",
      ready_for_pickup: "bg-purple-100 text-purple-800",
      assigned_to_rider: "bg-pink-100 text-pink-800",
      picked_up: "bg-cyan-100 text-cyan-800",
      on_the_way: "bg-teal-100 text-teal-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return `px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
      statusClasses[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  // Function to format order status text
  const formatStatus = (status) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Card title='Recent Orders'>
      {loading ? (
        <div className='animate-pulse'>
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className='grid grid-cols-12 gap-4 py-4 border-b border-gray-200 last:border-0'
            >
              <div className='col-span-2'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
              <div className='col-span-3'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
              <div className='col-span-2'>
                <div className='h-5 bg-gray-200 rounded-full w-20 mx-auto'></div>
              </div>
              <div className='col-span-2 text-center'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mx-auto'></div>
              </div>
              <div className='col-span-2'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
              </div>
              <div className='col-span-1'>
                <div className='h-8 bg-gray-200 rounded w-full'></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className='divide-y divide-gray-200'>
          {/* Table header */}
          <div className='grid grid-cols-12 gap-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
            <div className='col-span-2'>Order ID</div>
            <div className='col-span-3'>Customer</div>
            <div className='col-span-2 text-center'>Status</div>
            <div className='col-span-2 text-center'>Total</div>
            <div className='col-span-2'>Date</div>
            <div className='col-span-1'></div>
          </div>

          {/* Order rows */}
          {orders.map((order) => (
            <div
              key={order._id}
              className='grid grid-cols-12 gap-4 py-4 hover:bg-gray-50'
            >
              <div className='col-span-2'>
                <div className='text-sm font-medium text-gray-900'>
                  #{order._id.slice(-6)}
                </div>
                <div className='text-xs text-gray-500'>
                  {order.restaurant?.name || "Unknown Restaurant"}
                </div>
              </div>
              <div className='col-span-3'>
                <div className='text-sm font-medium text-gray-900'>
                  {order.user?.name || "Unknown Customer"}
                </div>
                <div className='text-xs text-gray-500'>
                  {order.user?.phone || "No phone"}
                </div>
              </div>
              <div className='col-span-2 text-center'>
                <span className={getStatusBadgeClass(order.status)}>
                  {formatStatus(order.status)}
                </span>
              </div>
              <div className='col-span-2 text-center text-sm text-gray-900 font-medium'>
                {formatCurrency(order.total)}
              </div>
              <div className='col-span-2 text-sm text-gray-500'>
                {formatDate(order.createdAt)}
              </div>
              <div className='col-span-1 flex justify-end'>
                <Link to={`/orders/${order._id}`}>
                  <Button variant='outline' size='xs'>
                    <FaEye className='mr-1' /> View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='py-4 text-center text-gray-500'>
          No recent orders found
        </div>
      )}

      {orders.length > 0 && (
        <div className='pt-4 border-t border-gray-200'>
          <Link
            to='/orders'
            className='text-primary-600 hover:text-primary-900 text-sm font-medium'
          >
            View all orders
          </Link>
        </div>
      )}
    </Card>
  );
};

RecentOrders.propTypes = {
  orders: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};

export default RecentOrders;
