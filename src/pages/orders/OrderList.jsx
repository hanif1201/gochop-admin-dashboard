import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaSort,
  FaDownload,
  FaCalendarAlt,
} from "react-icons/fa";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import orderService from "../../api/orders";
import { formatDate, formatCurrency } from "../../utils/formatter";

const OrderList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error } = useAlert();

  // State variables
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "all",
    restaurant: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = {};
        if (filters.status) queryParams.status = filters.status;
        if (filters.restaurant) queryParams.restaurant = filters.restaurant;

        // Handle date range filtering
        if (filters.dateRange === "today") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          queryParams.startDate = today.toISOString();
        } else if (filters.dateRange === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          queryParams.startDate = weekAgo.toISOString();
        } else if (filters.dateRange === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          queryParams.startDate = monthAgo.toISOString();
        } else if (
          filters.dateRange === "custom" &&
          customDateRange.startDate
        ) {
          queryParams.startDate = new Date(
            customDateRange.startDate
          ).toISOString();
          if (customDateRange.endDate) {
            const endDate = new Date(customDateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            queryParams.endDate = endDate.toISOString();
          }
        }

        // Determine which API method to call based on user role
        const response =
          user.role === "admin"
            ? await orderService.getOrders(queryParams)
            : await orderService.getMyOrders(queryParams);

        if (response.success) {
          setOrders(response.data);
        } else {
          error("Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        error(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [error, filters, user.role, customDateRange]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset custom date range when date range filter changes
    if (name === "dateRange" && value !== "custom") {
      setCustomDateRange({
        startDate: "",
        endDate: "",
      });
    }
  };

  // Handle custom date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    // Implementation for exporting orders to CSV
    alert("CSV export functionality would be implemented here");
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name &&
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.restaurant?.name &&
        order.restaurant.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (order.user?.email &&
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.phone && order.user.phone.includes(searchTerm))
  );

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

    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  // Function to format order status text
  const formatStatus = (status) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Table columns definition
  const columns = [
    {
      header: "Order ID",
      accessor: "_id",
      render: (order) => (
        <span className='font-medium text-primary-600'>
          #{order._id.substring(order._id.length - 6)}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: "user.name",
      render: (order) => (
        <div>
          <div className='font-medium text-gray-900'>
            {order.user?.name || "Guest User"}
          </div>
          <div className='text-gray-500 text-xs'>
            {order.user?.phone || "No phone"}
          </div>
        </div>
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
      header: "Status",
      accessor: "status",
      render: (order) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
            order.status
          )}`}
        >
          {formatStatus(order.status)}
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
    {
      header: "Actions",
      accessor: "actions",
      render: (order) => (
        <Button
          variant='outline'
          size='xs'
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/orders/${order._id}`);
          }}
        >
          <FaEye className='mr-1' /> View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Orders</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Manage all orders in the system
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex space-x-2'>
          <Button
            variant='outline'
            onClick={() => navigate("/orders/analytics")}
          >
            <FaSort className='mr-2' /> Analytics
          </Button>
          <Button variant='outline' onClick={handleExportCSV}>
            <FaDownload className='mr-2' /> Export CSV
          </Button>
        </div>
      </div>

      <Card className='mb-6'>
        <div className='flex flex-col md:flex-row md:items-center md:space-x-4'>
          <div className='relative flex-grow mb-4 md:mb-0'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='text'
              className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
              placeholder='Search by order ID, customer, or restaurant'
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div>
            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className='mr-2' /> Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className='mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label
                htmlFor='status'
                className='block text-sm font-medium text-gray-700'
              >
                Status
              </label>
              <select
                id='status'
                name='status'
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value=''>All Statuses</option>
                <option value='pending'>Pending</option>
                <option value='accepted'>Accepted</option>
                <option value='preparing'>Preparing</option>
                <option value='ready_for_pickup'>Ready for Pickup</option>
                <option value='assigned_to_rider'>Assigned to Rider</option>
                <option value='picked_up'>Picked Up</option>
                <option value='on_the_way'>On the Way</option>
                <option value='delivered'>Delivered</option>
                <option value='cancelled'>Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='dateRange'
                className='block text-sm font-medium text-gray-700'
              >
                Date Range
              </label>
              <select
                id='dateRange'
                name='dateRange'
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                value={filters.dateRange}
                onChange={handleFilterChange}
              >
                <option value='all'>All Time</option>
                <option value='today'>Today</option>
                <option value='week'>Last 7 Days</option>
                <option value='month'>Last 30 Days</option>
                <option value='custom'>Custom Range</option>
              </select>
            </div>

            {filters.dateRange === "custom" && (
              <div className='md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
                <div>
                  <label
                    htmlFor='startDate'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Start Date
                  </label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <FaCalendarAlt className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      type='date'
                      id='startDate'
                      name='startDate'
                      className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                      value={customDateRange.startDate}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='endDate'
                    className='block text-sm font-medium text-gray-700'
                  >
                    End Date
                  </label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <FaCalendarAlt className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      type='date'
                      id='endDate'
                      name='endDate'
                      className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                      value={customDateRange.endDate}
                      min={customDateRange.startDate}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className='flex items-end'>
              <Button
                variant='outline'
                onClick={() => {
                  setFilters({
                    status: "",
                    dateRange: "all",
                    restaurant: "",
                  });
                  setCustomDateRange({
                    startDate: "",
                    endDate: "",
                  });
                }}
                className='w-full'
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Table
        columns={columns}
        data={filteredOrders}
        loading={loading}
        onRowClick={(order) => navigate(`/orders/${order._id}`)}
        emptyMessage='No orders found'
      />
    </div>
  );
};

export default OrderList;
