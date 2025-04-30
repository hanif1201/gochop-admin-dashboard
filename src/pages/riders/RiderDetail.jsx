import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMotorcycle,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaToggleOn,
  FaToggleOff,
  FaStar,
  FaCalendarAlt,
  FaSpinner,
  FaShoppingBag,
  FaMoneyBillWave,
  FaCheck,
  FaTimes,
  FaImage,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import useAlert from "../../hooks/useAlert";
import riderService from "../../api/riders";
import orderService from "../../api/orders";
import { formatDate, formatCurrency } from "../../utils/formatter";

const RiderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useAlert();

  const [rider, setRider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [loadingRider, setLoadingRider] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // orders, documents, earnings

  // Fetch rider data
  useEffect(() => {
    const fetchRiderData = async () => {
      try {
        setLoadingRider(true);
        const response = await riderService.getRider(id);

        if (response.success) {
          setRider(response.data);
        } else {
          error("Failed to fetch rider details");
          navigate("/riders");
        }
      } catch (err) {
        console.error("Error fetching rider:", err);
        error("An error occurred while fetching rider data");
        navigate("/riders");
      } finally {
        setLoadingRider(false);
      }
    };

    fetchRiderData();
  }, [id, navigate, error]);

  // Fetch rider orders
  useEffect(() => {
    const fetchRiderOrders = async () => {
      try {
        setLoadingOrders(true);
        // In a real app, you would have an endpoint to get orders for a specific rider
        // This is a placeholder using the general getOrders endpoint
        const response = await orderService.getOrders({ rider: id });

        if (response.success) {
          setOrders(response.data);
        } else {
          error("Failed to fetch rider orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        error("An error occurred while fetching order data");
      } finally {
        setLoadingOrders(false);
      }
    };

    if (rider) {
      fetchRiderOrders();
    }
  }, [id, rider, error]);

  // Fetch rider earnings
  useEffect(() => {
    const fetchRiderEarnings = async () => {
      try {
        setLoadingEarnings(true);
        // In a real app, you would fetch this from an earnings endpoint for the specific rider
        // This is a placeholder for demonstration
        const response = await riderService.getEarnings({ riderId: id });

        if (response.success) {
          setEarnings(response.data);
        } else {
          error("Failed to fetch rider earnings");
        }
      } catch (err) {
        console.error("Error fetching earnings:", err);
        error("An error occurred while fetching earnings data");
      } finally {
        setLoadingEarnings(false);
      }
    };

    if (rider) {
      fetchRiderEarnings();
    }
  }, [id, rider, error]);

  // Handle rider status toggle
  const handleToggleStatus = async () => {
    try {
      const newStatus = rider.status === "active" ? "inactive" : "active";
      const response = await riderService.updateRider(id, {
        status: newStatus,
      });

      if (response.success) {
        setRider({
          ...rider,
          status: newStatus,
        });
        success(`Rider status updated to ${newStatus}`);
      } else {
        error("Failed to update rider status");
      }
    } catch (err) {
      console.error("Error toggling rider status:", err);
      error(err.message || "Failed to update rider status");
    }
  };

  // Handle rider availability toggle
  const handleToggleAvailability = async () => {
    try {
      const response = await riderService.updateStatus({
        isAvailable: !rider.isAvailable,
      });

      if (response.success) {
        setRider({
          ...rider,
          isAvailable: !rider.isAvailable,
        });
        success(
          `Rider is now ${
            !rider.isAvailable ? "available" : "unavailable"
          } for deliveries`
        );
      } else {
        error("Failed to update rider availability");
      }
    } catch (err) {
      console.error("Error toggling rider availability:", err);
      error(err.message || "Failed to update rider availability");
    }
  };

  // Handle rider deletion
  const handleDeleteRider = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this rider? This action cannot be undone."
      )
    ) {
      try {
        const response = await riderService.deleteRider(id);

        if (response.success) {
          success("Rider deleted successfully");
          navigate("/riders");
        } else {
          error("Failed to delete rider");
        }
      } catch (err) {
        console.error("Error deleting rider:", err);
        error(err.message || "Failed to delete rider");
      }
    }
  };

  // Function to get status badge color
  const getOrderStatusBadgeClass = (status) => {
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

    return `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
      statusClasses[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  // Function to format order status text
  const formatOrderStatus = (status) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Order table columns
  const orderColumns = [
    {
      header: "Order ID",
      accessor: "_id",
      render: (order) => (
        <Link to={`/orders/${order._id}`}>
          <span className='font-medium text-primary-600 hover:text-primary-800'>
            #{order._id.substring(order._id.length - 6)}
          </span>
        </Link>
      ),
    },
    {
      header: "Restaurant",
      accessor: "restaurant.name",
      render: (order) => (
        <div className='flex items-center'>
          <div className='h-8 w-8 flex-shrink-0'>
            <img
              className='h-8 w-8 rounded-full object-cover'
              src={order.restaurant?.logo || "https://via.placeholder.com/40"}
              alt={order.restaurant?.name || "Restaurant"}
            />
          </div>
          <div className='ml-3'>
            <div className='text-sm font-medium text-gray-900'>
              {order.restaurant?.name || "Unknown Restaurant"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: "user.name",
      render: (order) => (
        <div className='text-sm'>
          <div className='font-medium text-gray-900'>
            {order.user?.name || "Unknown Customer"}
          </div>
          <div className='text-gray-500'>{order.user?.phone || "No phone"}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (order) => (
        <span className={getOrderStatusBadgeClass(order.status)}>
          {formatOrderStatus(order.status)}
        </span>
      ),
    },
    {
      header: "Total",
      accessor: "total",
      render: (order) => formatCurrency(order.total),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (order) => formatDate(order.createdAt),
    },
  ];

  if (loadingRider) {
    return (
      <div className='flex justify-center items-center h-64'>
        <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
        <span className='ml-2 text-gray-600'>Loading rider data...</span>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className='text-center p-8'>
        <h2 className='text-2xl font-semibold text-gray-900'>
          Rider not found
        </h2>
        <p className='mt-2 text-gray-600'>
          The rider you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant='primary'
          className='mt-4'
          onClick={() => navigate("/riders")}
        >
          Back to Riders
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
        <div>
          <div className='flex items-center'>
            <Button
              variant='text'
              size='sm'
              className='mr-2'
              onClick={() => navigate("/riders")}
            >
              <FaArrowLeft className='mr-1' /> Back
            </Button>
            <h1 className='text-2xl font-bold text-gray-900'>{rider.name}</h1>
          </div>
          <p className='mt-1 text-sm text-gray-500 flex items-center'>
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                rider.status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            {rider.status === "active" ? "Active" : "Inactive"} ·{" "}
            <span
              className={`ml-2 inline-block w-2 h-2 rounded-full mr-2 ${
                rider.isAvailable ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            {rider.isAvailable ? "Available" : "Unavailable"}
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex flex-wrap gap-2'>
          <Button
            variant={rider.isAvailable ? "outline" : "primary"}
            size='sm'
            onClick={handleToggleAvailability}
          >
            {rider.isAvailable ? (
              <>
                <FaToggleOff className='mr-1' /> Mark Unavailable
              </>
            ) : (
              <>
                <FaToggleOn className='mr-1' /> Mark Available
              </>
            )}
          </Button>
          <Button
            variant={rider.status === "active" ? "outline" : "success"}
            size='sm'
            onClick={handleToggleStatus}
          >
            {rider.status === "active" ? (
              <>
                <FaTimes className='mr-1' /> Deactivate
              </>
            ) : (
              <>
                <FaCheck className='mr-1' /> Activate
              </>
            )}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate(`/riders/edit/${id}`)}
          >
            <FaEdit className='mr-1' /> Edit
          </Button>
          <Button variant='danger' size='sm' onClick={handleDeleteRider}>
            <FaTrash className='mr-1' /> Delete
          </Button>
        </div>
      </div>

      {/* Rider Profile Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Basic Information */}
        <Card className='md:col-span-1'>
          <div className='flex flex-col items-center pb-4 border-b border-gray-200'>
            <div className='h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4'>
              {rider.avatar ? (
                <img
                  src={rider.avatar}
                  alt={rider.name}
                  className='h-full w-full object-cover'
                />
              ) : (
                <FaUser className='h-12 w-12 text-gray-400' />
              )}
            </div>
            <h3 className='text-lg font-medium text-gray-900'>{rider.name}</h3>
            <p className='text-sm text-gray-500'>{rider.email}</p>
            <div className='mt-2 flex items-center'>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(rider.rating || 0)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className='ml-1 text-gray-500 text-sm'>
                {rider.rating?.toFixed(1) || "No ratings"} (
                {rider.ratingCount || 0})
              </span>
            </div>
          </div>

          <div className='pt-4 space-y-4'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <FaPhone className='h-5 w-5 text-gray-400' />
              </div>
              <div className='ml-3 text-sm'>
                <p className='text-gray-900 font-medium'>Phone</p>
                <p className='text-gray-500'>{rider.phone}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <FaCalendarAlt className='h-5 w-5 text-gray-400' />
              </div>
              <div className='ml-3 text-sm'>
                <p className='text-gray-900 font-medium'>Joined</p>
                <p className='text-gray-500'>{formatDate(rider.createdAt)}</p>
              </div>
            </div>

            {rider.currentLocation && (
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaMapMarkerAlt className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Current Location</p>
                  <p className='text-gray-500'>
                    {rider.currentLocation.coordinates
                      ? `${rider.currentLocation.coordinates[1].toFixed(
                          4
                        )}, ${rider.currentLocation.coordinates[0].toFixed(4)}`
                      : "Location data not available"}
                  </p>
                  <p className='text-gray-500 text-xs'>
                    {rider.lastLocationUpdate
                      ? `Updated ${formatDate(rider.lastLocationUpdate)}`
                      : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Vehicle Information */}
        <Card title='Vehicle Information' className='md:col-span-1'>
          <div className='space-y-4'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <FaMotorcycle className='h-5 w-5 text-gray-400' />
              </div>
              <div className='ml-3 text-sm'>
                <p className='text-gray-900 font-medium'>Vehicle Type</p>
                <p className='text-gray-500'>
                  {rider.vehicleType
                    ? rider.vehicleType.charAt(0).toUpperCase() +
                      rider.vehicleType.slice(1)
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <FaMotorcycle className='h-5 w-5 text-gray-400' />
              </div>
              <div className='ml-3 text-sm'>
                <p className='text-gray-900 font-medium'>Model</p>
                <p className='text-gray-500'>{rider.vehicleModel || "N/A"}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <FaIdCard className='h-5 w-5 text-gray-400' />
              </div>
              <div className='ml-3 text-sm'>
                <p className='text-gray-900 font-medium'>License Plate</p>
                <p className='text-gray-500'>{rider.vehiclePlate || "N/A"}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <FaIdCard className='h-5 w-5 text-gray-400' />
              </div>
              <div className='ml-3 text-sm'>
                <p className='text-gray-900 font-medium'>License Number</p>
                <p className='text-gray-500'>{rider.licenseNumber || "N/A"}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <FaMapMarkerAlt className='h-5 w-5 text-gray-400' />
              </div>
              <div className='ml-3 text-sm'>
                <p className='text-gray-900 font-medium'>
                  Max Delivery Distance
                </p>
                <p className='text-gray-500'>{rider.maxDeliveryDistance} km</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Earnings Summary */}
        <Card title='Earnings Summary' className='md:col-span-1'>
          {loadingEarnings ? (
            <div className='animate-pulse space-y-4'>
              <div className='h-10 bg-gray-200 rounded w-3/4'></div>
              <div className='h-10 bg-gray-200 rounded w-1/2'></div>
              <div className='h-10 bg-gray-200 rounded w-2/3'></div>
              <div className='h-10 bg-gray-200 rounded w-1/3'></div>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Total Earnings</span>
                <span className='text-xl font-bold text-gray-900'>
                  {formatCurrency(earnings.total)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Today</span>
                <span className='font-medium text-gray-900'>
                  {formatCurrency(earnings.today)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>This Week</span>
                <span className='font-medium text-gray-900'>
                  {formatCurrency(earnings.thisWeek)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>This Month</span>
                <span className='font-medium text-gray-900'>
                  {formatCurrency(earnings.thisMonth)}
                </span>
              </div>
              <div className='pt-4 border-t border-gray-200'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Completed Orders</span>
                  <span className='font-medium text-gray-900'>
                    {orders.filter((o) => o.status === "delivered").length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className='mb-6'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              className={`${
                activeTab === "orders"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab("orders")}
            >
              <FaShoppingBag className='inline-block mr-2 -mt-1' />
              Orders History
            </button>
            <button
              className={`${
                activeTab === "documents"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab("documents")}
            >
              <FaIdCard className='inline-block mr-2 -mt-1' />
              Documents
            </button>
            <button
              className={`${
                activeTab === "earnings"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab("earnings")}
            >
              <FaMoneyBillWave className='inline-block mr-2 -mt-1' />
              Earnings Breakdown
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Table
            columns={orderColumns}
            data={orders}
            loading={loadingOrders}
            onRowClick={(order) => navigate(`/orders/${order._id}`)}
            emptyMessage='No order history found'
          />
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Driver's License */}
            <Card title="Driver's License">
              {rider.documents?.license ? (
                <div className='flex flex-col items-center'>
                  <img
                    src={rider.documents.license}
                    alt="Driver's License"
                    className='max-h-64 object-contain rounded-md'
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-4'
                    onClick={() =>
                      window.open(rider.documents.license, "_blank")
                    }
                  >
                    View Full Size
                  </Button>
                </div>
              ) : (
                <div className='text-center py-6'>
                  <FaIdCard className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-2 text-sm text-gray-500'>
                    No license document uploaded
                  </p>
                </div>
              )}
            </Card>

            {/* Insurance Document */}
            <Card title='Vehicle Insurance'>
              {rider.documents?.insurance ? (
                <div className='flex flex-col items-center'>
                  <img
                    src={rider.documents.insurance}
                    alt='Vehicle Insurance'
                    className='max-h-64 object-contain rounded-md'
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-4'
                    onClick={() =>
                      window.open(rider.documents.insurance, "_blank")
                    }
                  >
                    View Full Size
                  </Button>
                </div>
              ) : (
                <div className='text-center py-6'>
                  <FaImage className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-2 text-sm text-gray-500'>
                    No insurance document uploaded
                  </p>
                </div>
              )}
            </Card>

            {/* Additional Documents */}
            <Card title='Additional Documents'>
              {rider.documents?.additional &&
              rider.documents.additional.length > 0 ? (
                <div className='space-y-4'>
                  {rider.documents.additional.map((doc, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center'>
                        <FaImage className='h-5 w-5 text-gray-400 mr-2' />
                        <span className='text-sm text-gray-700'>
                          {doc.type || `Document ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        variant='outline'
                        size='xs'
                        onClick={() => window.open(doc.url, "_blank")}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-6'>
                  <FaImage className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-2 text-sm text-gray-500'>
                    No additional documents uploaded
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div>
            {loadingEarnings ? (
              <div className='animate-pulse space-y-4'>
                <div className='h-64 bg-gray-200 rounded'></div>
                <div className='h-64 bg-gray-200 rounded'></div>
              </div>
            ) : (
              <div className='space-y-6'>
                <Card title='Earnings by Week'>
                  {/* This would typically be a chart component showing earnings over time */}
                  <div className='h-64 flex items-center justify-center bg-gray-100 rounded-md'>
                    <p className='text-gray-500'>
                      Earnings chart would be displayed here
                    </p>
                  </div>
                </Card>

                <Card title='Recent Payments'>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Payment ID
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Date
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Orders
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Amount
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {/* Sample data - in a real app this would come from the API */}
                        <tr>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            PAY-1234
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {formatDate(new Date(Date.now() - 86400000))}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            5
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {formatCurrency(75.5)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                              Paid
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            PAY-1233
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {formatDate(new Date(Date.now() - 7 * 86400000))}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            8
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {formatCurrency(120.75)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                              Paid
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            PAY-1232
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {formatDate(new Date(Date.now() - 14 * 86400000))}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            6
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {formatCurrency(90.25)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                              Paid
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDetail;
