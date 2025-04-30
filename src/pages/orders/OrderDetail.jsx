import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaUtensils,
  FaMotorcycle,
  FaMapMarkerAlt,
  FaCreditCard,
  FaShoppingBasket,
  FaSpinner,
  FaPrint,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import orderService from "../../api/orders";
import { formatDate, formatCurrency } from "../../utils/formatter";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useAlert();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrder(id);

        if (response.success) {
          setOrder(response.data);
        } else {
          error("Failed to fetch order details");
          navigate("/orders");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        error("An error occurred while fetching order data");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id, navigate, error]);

  // Handle order status update
  const handleUpdateStatus = async (newStatus) => {
    try {
      setStatusLoading(true);
      const response = await orderService.updateOrderStatus(id, {
        status: newStatus,
      });

      if (response.success) {
        setOrder({
          ...order,
          status: newStatus,
        });
        success(`Order status updated to ${formatStatus(newStatus)}`);
      } else {
        error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      error(err.message || "Failed to update order status");
    } finally {
      setStatusLoading(false);
    }
  };

  // Function to format order status text
  const formatStatus = (status) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

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

    return `px-3 py-1 text-sm rounded-full ${
      statusClasses[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  // Function to get available actions based on current status
  const getAvailableActions = (status) => {
    switch (status) {
      case "pending":
        return ["accepted", "cancelled"];
      case "accepted":
        return ["preparing", "cancelled"];
      case "preparing":
        return ["ready_for_pickup", "cancelled"];
      case "ready_for_pickup":
        return ["assigned_to_rider", "cancelled"];
      case "assigned_to_rider":
        return ["picked_up", "cancelled"];
      case "picked_up":
        return ["on_the_way"];
      case "on_the_way":
        return ["delivered"];
      case "delivered":
      case "cancelled":
        return [];
      default:
        return [];
    }
  };

  // Function to render status timeline
  const renderStatusTimeline = (order) => {
    const statuses = [
      "pending",
      "accepted",
      "preparing",
      "ready_for_pickup",
      "assigned_to_rider",
      "picked_up",
      "on_the_way",
      "delivered",
    ];

    const currentStatusIndex = statuses.indexOf(order.status);
    const isCancelled = order.status === "cancelled";

    return (
      <div className='py-4'>
        <div className='relative'>
          {/* Line connecting all steps */}
          <div
            className='absolute inset-0 flex items-center'
            aria-hidden='true'
          >
            <div className='h-0.5 w-full bg-gray-200'></div>
          </div>

          {/* Status steps */}
          <div className='relative flex justify-between'>
            {statuses.map((status, index) => {
              // Skip some statuses to avoid overcrowding
              if (index > 0 && index < statuses.length - 1 && index % 2 === 1) {
                return null;
              }

              const isActive = index <= currentStatusIndex && !isCancelled;
              const isCurrent = index === currentStatusIndex && !isCancelled;

              return (
                <div key={status} className='flex flex-col items-center'>
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-primary-600"
                        : isCancelled
                        ? "bg-red-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {isCurrent ? (
                      <div className='h-4 w-4 rounded-full bg-white'></div>
                    ) : (
                      <div className='h-2 w-2 rounded-full bg-white'></div>
                    )}
                  </div>
                  <div className='text-xs mt-1 text-center hidden md:block'>
                    {formatStatus(status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isCancelled && (
          <div className='mt-4 text-center'>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800'>
              <FaTimesCircle className='mr-1' /> Order Cancelled
            </span>
          </div>
        )}
      </div>
    );
  };

  // Handle print receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
        <span className='ml-2 text-gray-600'>Loading order data...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='text-center p-8'>
        <h2 className='text-2xl font-semibold text-gray-900'>
          Order not found
        </h2>
        <p className='mt-2 text-gray-600'>
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant='primary'
          className='mt-4'
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className='print:bg-white print:shadow-none'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 print:hidden'>
        <div>
          <div className='flex items-center'>
            <Button
              variant='text'
              size='sm'
              className='mr-2'
              onClick={() => navigate("/orders")}
            >
              <FaArrowLeft className='mr-1' /> Back
            </Button>
            <h1 className='text-2xl font-bold text-gray-900'>
              Order #{order._id.substring(order._id.length - 6)}
            </h1>
          </div>
          <p className='mt-1 text-sm text-gray-500 flex items-center'>
            <span className={getStatusBadgeClass(order.status)}>
              {formatStatus(order.status)}
            </span>
            <span className='ml-2'>{formatDate(order.createdAt)}</span>
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' onClick={handlePrintReceipt}>
            <FaPrint className='mr-1' /> Print Receipt
          </Button>

          {getAvailableActions(order.status).map((action) => (
            <Button
              key={action}
              variant={action === "cancelled" ? "danger" : "primary"}
              size='sm'
              loading={statusLoading}
              disabled={statusLoading}
              onClick={() => handleUpdateStatus(action)}
            >
              {action === "cancelled" ? (
                <FaTimesCircle className='mr-1' />
              ) : (
                <FaCheckCircle className='mr-1' />
              )}
              {formatStatus(action)}
            </Button>
          ))}
        </div>
      </div>

      {/* Order Status Timeline */}
      <Card className='mb-6 print:shadow-none print:border print:border-gray-200'>
        <h2 className='text-lg font-medium text-gray-900 mb-2'>Order Status</h2>
        {renderStatusTimeline(order)}
      </Card>

      {/* Order Details Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Customer Information */}
        <Card className='md:col-span-1 print:shadow-none print:border print:border-gray-200'>
          <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
            <FaUser className='mr-2 text-gray-400' /> Customer Information
          </h2>
          <div className='space-y-3'>
            <div>
              <div className='font-medium text-gray-900'>
                {order.user?.name || "Guest User"}
              </div>
              <div className='text-gray-500 text-sm flex items-center mt-1'>
                <FaEnvelope className='mr-1 text-gray-400' />
                {order.user?.email || "N/A"}
              </div>
              <div className='text-gray-500 text-sm flex items-center mt-1'>
                <FaPhone className='mr-1 text-gray-400' />
                {order.user?.phone || "N/A"}
              </div>
            </div>

            <div className='pt-3 border-t border-gray-200'>
              <div className='font-medium text-gray-900 flex items-center'>
                <FaMapMarkerAlt className='mr-1 text-gray-400' /> Delivery
                Address
              </div>
              <div className='text-gray-500 text-sm mt-1'>
                {order.deliveryAddress
                  ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.postalCode}`
                  : "No address provided"}
              </div>
            </div>

            {order.deliveryInstructions && (
              <div className='pt-3 border-t border-gray-200'>
                <div className='font-medium text-gray-900'>
                  Delivery Instructions
                </div>
                <div className='text-gray-500 text-sm mt-1'>
                  {order.deliveryInstructions}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Restaurant Information */}
        <Card className='md:col-span-1 print:shadow-none print:border print:border-gray-200'>
          <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
            <FaUtensils className='mr-2 text-gray-400' /> Restaurant Information
          </h2>
          <div className='flex items-center mb-3'>
            <div className='h-12 w-12 flex-shrink-0'>
              <img
                className='h-12 w-12 rounded-full object-cover'
                src={order.restaurant?.logo || "https://via.placeholder.com/48"}
                alt={order.restaurant?.name || "Restaurant"}
              />
            </div>
            <div className='ml-4'>
              <div className='font-medium text-gray-900'>
                {order.restaurant?.name || "Unknown Restaurant"}
              </div>
              <div className='text-gray-500 text-sm'>
                {order.restaurant?.phone || "No phone provided"}
              </div>
            </div>
          </div>

          <div className='text-gray-500 text-sm flex items-start'>
            <FaMapMarkerAlt className='mr-1 text-gray-400 mt-1 flex-shrink-0' />
            <span>
              {order.restaurant?.address
                ? `${order.restaurant.address.street}, ${order.restaurant.address.city}, ${order.restaurant.address.state} ${order.restaurant.address.postalCode}`
                : "No address provided"}
            </span>
          </div>

          {order.estimatedDeliveryTime && (
            <div className='flex items-center mt-3 pt-3 border-t border-gray-200'>
              <div className='text-gray-900 font-medium'>
                Estimated Delivery Time
              </div>
              <div className='ml-auto text-gray-900 font-medium'>
                {order.estimatedDeliveryTime} minutes
              </div>
            </div>
          )}

          {order.restaurantNotes && (
            <div className='mt-3 pt-3 border-t border-gray-200'>
              <div className='font-medium text-gray-900'>Restaurant Notes</div>
              <div className='text-gray-500 text-sm mt-1'>
                {order.restaurantNotes}
              </div>
            </div>
          )}
        </Card>

        {/* Rider Information */}
        <Card className='md:col-span-1 print:shadow-none print:border print:border-gray-200'>
          <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
            <FaMotorcycle className='mr-2 text-gray-400' /> Delivery Information
          </h2>

          {order.rider ? (
            <div>
              <div className='flex items-center mb-3'>
                <div className='h-12 w-12 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden'>
                  {order.rider.avatar ? (
                    <img
                      src={order.rider.avatar}
                      alt={order.rider.name}
                      className='h-12 w-12 object-cover'
                    />
                  ) : (
                    <FaUser className='h-6 w-6 text-gray-400' />
                  )}
                </div>
                <div className='ml-4'>
                  <div className='font-medium text-gray-900'>
                    {order.rider.name}
                  </div>
                  <div className='text-gray-500 text-sm'>
                    {order.rider.phone || "No phone provided"}
                  </div>
                </div>
              </div>

              {order.status === "on_the_way" && order.estimatedArrival && (
                <div className='bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-3'>
                  <div className='font-medium text-yellow-800'>
                    Estimated Arrival
                  </div>
                  <div className='text-yellow-700 font-medium text-lg'>
                    {formatDate(order.estimatedArrival, {
                      hour: "numeric",
                      minute: "2-digit",
                      second: undefined,
                      year: undefined,
                      month: undefined,
                      day: undefined,
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : order.status === "delivered" ? (
            <div className='bg-green-50 p-3 rounded-lg border border-green-100'>
              <div className='font-medium text-green-800 flex items-center'>
                <FaCheckCircle className='mr-2' /> Order Delivered
              </div>
              <div className='text-green-700 mt-1'>
                {order.deliveredAt
                  ? `Delivered at ${formatDate(order.deliveredAt)}`
                  : "Delivery confirmed"}
              </div>
            </div>
          ) : order.status === "cancelled" ? (
            <div className='bg-red-50 p-3 rounded-lg border border-red-100'>
              <div className='font-medium text-red-800 flex items-center'>
                <FaTimesCircle className='mr-2' /> Order Cancelled
              </div>
              <div className='text-red-700 mt-1'>
                {order.cancelledAt
                  ? `Cancelled at ${formatDate(order.cancelledAt)}`
                  : "Order was cancelled"}
              </div>
              {order.cancellationReason && (
                <div className='text-red-700 mt-1'>
                  Reason: {order.cancellationReason}
                </div>
              )}
            </div>
          ) : (
            <div className='text-gray-500'>
              No rider assigned yet. The restaurant will assign a rider once the
              order is ready for pickup.
            </div>
          )}

          {order.deliveryFee !== undefined && (
            <div className='flex items-center mt-3 pt-3 border-t border-gray-200'>
              <div className='text-gray-900 font-medium'>Delivery Fee</div>
              <div className='ml-auto text-gray-900 font-medium'>
                {formatCurrency(order.deliveryFee)}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Order Items */}
      <Card className='mb-6 print:shadow-none print:border print:border-gray-200'>
        <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
          <FaShoppingBasket className='mr-2 text-gray-400' /> Order Items
        </h2>

        <div className='overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Item
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Quantity
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Price
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 flex-shrink-0'>
                        <img
                          className='h-10 w-10 rounded-md object-cover'
                          src={item.image || "https://via.placeholder.com/40"}
                          alt={item.name}
                        />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {item.name}
                        </div>
                        {item.options && item.options.length > 0 && (
                          <div className='text-xs text-gray-500'>
                            {item.options
                              .map(
                                (option) => `${option.name}: ${option.value}`
                              )
                              .join(", ")}
                          </div>
                        )}
                        {item.specialInstructions && (
                          <div className='text-xs italic text-gray-500'>
                            {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {item.quantity}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right'>
                    {formatCurrency(item.price)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right'>
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className='border-t border-gray-200'>
                <td
                  colSpan='3'
                  className='px-6 py-3 text-right text-sm font-medium text-gray-500'
                >
                  Subtotal
                </td>
                <td className='px-6 py-3 text-right text-sm font-medium text-gray-900'>
                  {formatCurrency(order.subtotal)}
                </td>
              </tr>
              {order.tax > 0 && (
                <tr>
                  <td
                    colSpan='3'
                    className='px-6 py-3 text-right text-sm font-medium text-gray-500'
                  >
                    Tax
                  </td>
                  <td className='px-6 py-3 text-right text-sm font-medium text-gray-900'>
                    {formatCurrency(order.tax)}
                  </td>
                </tr>
              )}
              {order.deliveryFee > 0 && (
                <tr>
                  <td
                    colSpan='3'
                    className='px-6 py-3 text-right text-sm font-medium text-gray-500'
                  >
                    Delivery Fee
                  </td>
                  <td className='px-6 py-3 text-right text-sm font-medium text-gray-900'>
                    {formatCurrency(order.deliveryFee)}
                  </td>
                </tr>
              )}
              {order.tip > 0 && (
                <tr>
                  <td
                    colSpan='3'
                    className='px-6 py-3 text-right text-sm font-medium text-gray-500'
                  >
                    Tip
                  </td>
                  <td className='px-6 py-3 text-right text-sm font-medium text-gray-900'>
                    {formatCurrency(order.tip)}
                  </td>
                </tr>
              )}
              {order.discount > 0 && (
                <tr>
                  <td
                    colSpan='3'
                    className='px-6 py-3 text-right text-sm font-medium text-gray-500'
                  >
                    Discount
                  </td>
                  <td className='px-6 py-3 text-right text-sm font-medium text-text-green-600'>
                    -{formatCurrency(order.discount)}
                  </td>
                </tr>
              )}
              <tr className='border-t border-gray-200 bg-gray-50'>
                <td
                  colSpan='3'
                  className='px-6 py-3 text-right text-base font-bold text-gray-900'
                >
                  Total
                </td>
                <td className='px-6 py-3 text-right text-base font-bold text-gray-900'>
                  {formatCurrency(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Payment Information */}
      <Card className='mb-6 print:shadow-none print:border print:border-gray-200'>
        <h2 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
          <FaCreditCard className='mr-2 text-gray-400' /> Payment Information
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <div className='text-gray-500 text-sm font-medium'>
              Payment Method
            </div>
            <div className='text-gray-900 font-medium'>
              {order.paymentMethod === "credit_card"
                ? "Credit Card"
                : order.paymentMethod === "paypal"
                ? "PayPal"
                : order.paymentMethod === "cash"
                ? "Cash on Delivery"
                : order.paymentMethod || "Unknown"}
            </div>
            {order.paymentMethod === "credit_card" && order.paymentDetails && (
              <div className='text-gray-500 text-sm mt-1'>
                {order.paymentDetails.cardType} ending in{" "}
                {order.paymentDetails.last4}
              </div>
            )}
          </div>

          <div>
            <div className='text-gray-500 text-sm font-medium'>
              Payment Status
            </div>
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : order.paymentStatus === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : order.paymentStatus === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {order.paymentStatus === "paid" ? (
                <>
                  <FaCheckCircle className='mr-1' /> Paid
                </>
              ) : order.paymentStatus === "pending" ? (
                "Pending"
              ) : order.paymentStatus === "failed" ? (
                <>
                  <FaTimesCircle className='mr-1' /> Failed
                </>
              ) : (
                order.paymentStatus || "Unknown"
              )}
            </div>
            {order.paymentDate && (
              <div className='text-gray-500 text-sm mt-1'>
                {formatDate(order.paymentDate)}
              </div>
            )}
          </div>
        </div>

        {order.paymentStatus === "failed" && order.paymentError && (
          <div className='mt-4 p-3 bg-red-50 rounded-md border border-red-100'>
            <div className='text-sm font-medium text-red-800'>
              Payment Error
            </div>
            <div className='text-sm text-red-700'>{order.paymentError}</div>
          </div>
        )}
      </Card>

      {/* Order Rating and Review (if available) */}
      {order.rating && (
        <Card className='mb-6 print:shadow-none print:border print:border-gray-200'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>
            Customer Rating & Review
          </h2>

          <div className='flex items-center mb-2'>
            <div className='flex'>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${
                    i < order.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              ))}
              <span className='ml-2 text-gray-900 font-medium'>
                {order.rating}/5
              </span>
            </div>
            <div className='ml-4 text-gray-500 text-sm'>
              {order.ratingDate
                ? formatDate(order.ratingDate)
                : "Rating submitted"}
            </div>
          </div>

          {order.review && (
            <div className='mt-2 p-3 bg-gray-50 rounded-md'>
              <p className='text-gray-700'>{order.review}</p>
            </div>
          )}

          {order.restaurantReply && (
            <div className='mt-3 ml-6 p-3 bg-blue-50 rounded-md border-l-4 border-blue-300'>
              <p className='text-sm font-medium text-gray-900'>
                Restaurant Reply:
              </p>
              <p className='text-sm text-gray-700 mt-1'>
                {order.restaurantReply}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default OrderDetail;
