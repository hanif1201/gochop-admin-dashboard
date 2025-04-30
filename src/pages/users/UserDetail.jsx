import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaIdCard,
  FaShoppingBag,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import useAlert from "../../hooks/useAlert";
import userService from "../../api/users";
import orderService from "../../api/orders";
import { formatDate, formatCurrency } from "../../utils/formatter";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useAlert();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);
        const response = await userService.getUser(id);

        if (response.success) {
          setUser(response.data);
        } else {
          error("Failed to fetch user details");
          navigate("/users");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        error("An error occurred while fetching user data");
        navigate("/users");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [id, navigate, error]);

  // Fetch user orders
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoadingOrders(true);
        const response = await orderService.getOrders({ user: id });

        if (response.success) {
          setOrders(response.data);
        } else {
          error("Failed to fetch user orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        error("An error occurred while fetching order data");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [id, error]);

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        const response = await userService.deleteUser(id);

        if (response.success) {
          success("User deleted successfully");
          navigate("/users");
        } else {
          error("Failed to delete user");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        error(err.message || "Failed to delete user");
      }
    }
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
      header: "Date",
      accessor: "createdAt",
      render: (order) => formatDate(order.createdAt),
    },
    {
      header: "Status",
      accessor: "status",
      render: (order) => {
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800",
          accepted: "bg-blue-100 text-blue-800",
          preparing: "bg-indigo-100 text-indigo-800",
          ready_for_pickup: "bg-purple-100 text-purple-800",
          picked_up: "bg-cyan-100 text-cyan-800",
          delivered: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
        };

        const statusClass =
          statusColors[order.status] || "bg-gray-100 text-gray-800";
        const formattedStatus = order.status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
          >
            {formattedStatus}
          </span>
        );
      },
    },
    {
      header: "Total",
      accessor: "total",
      render: (order) => formatCurrency(order.total),
    },
  ];

  if (loadingUser) {
    return (
      <div className='flex justify-center items-center h-64'>
        <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
        <span className='ml-2 text-gray-600'>Loading user data...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='text-center p-8'>
        <h2 className='text-2xl font-semibold text-gray-900'>User not found</h2>
        <p className='mt-2 text-gray-600'>
          The user you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant='primary'
          className='mt-4'
          onClick={() => navigate("/users")}
        >
          Back to Users
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
              onClick={() => navigate("/users")}
            >
              <FaArrowLeft className='mr-1' /> Back
            </Button>
            <h1 className='text-2xl font-bold text-gray-900'>{user.name}</h1>
          </div>
          <p className='mt-1 text-sm text-gray-500 flex items-center'>
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                user.status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            {user.status === "active" ? "Active" : "Inactive"} ·{" "}
            {user.role
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
              : "User"}
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate(`/users/edit/${id}`)}
          >
            <FaEdit className='mr-1' /> Edit
          </Button>
          <Button variant='danger' size='sm' onClick={handleDeleteUser}>
            <FaTrash className='mr-1' /> Delete
          </Button>
        </div>
      </div>

      {/* User Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* User Profile */}
        <div className='md:col-span-1'>
          <Card title='User Profile'>
            <div className='flex flex-col items-center pb-4 border-b border-gray-200'>
              <div className='h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4'>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <FaUser className='h-12 w-12 text-gray-400' />
                )}
              </div>
              <h3 className='text-lg font-medium text-gray-900'>{user.name}</h3>
              <p className='text-sm text-gray-500'>{user.email}</p>
              <div className='mt-2 flex items-center'>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "restaurant"
                      ? "bg-blue-100 text-blue-800"
                      : user.role === "rider"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role ? user.role.toUpperCase() : "USER"}
                </span>
              </div>
            </div>

            <div className='space-y-4 pt-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaIdCard className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>ID</p>
                  <p className='text-gray-500'>{user._id}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaPhone className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Phone</p>
                  <p className='text-gray-500'>
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaClock className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Joined</p>
                  <p className='text-gray-500'>{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* User Address */}
        <div className='md:col-span-1'>
          <Card title='Address Information'>
            {user.addresses && user.addresses.length > 0 ? (
              <div className='space-y-4'>
                {user.addresses.map((address, index) => (
                  <div
                    key={index}
                    className='p-3 border border-gray-200 rounded-md'
                  >
                    <div className='flex justify-between items-start'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        {address.type || "Address"} {index + 1}
                      </h4>
                      {address.isDefault && (
                        <span className='px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'>
                          Default
                        </span>
                      )}
                    </div>
                    <div className='mt-2 flex'>
                      <FaMapMarkerAlt className='h-5 w-5 text-gray-400 flex-shrink-0' />
                      <p className='ml-2 text-sm text-gray-500'>
                        {address.street}, {address.city}, {address.state}{" "}
                        {address.postalCode}, {address.country}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-4 text-center text-gray-500'>
                No address information available
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary */}
        <div className='md:col-span-1'>
          <Card title='Order Summary'>
            <div className='space-y-4 text-center'>
              <div>
                <div className='text-3xl font-bold text-gray-900'>
                  {orders.length}
                </div>
                <div className='text-sm text-gray-500'>Total Orders</div>
              </div>

              <div className='grid grid-cols-2 gap-4 pt-4 border-t border-gray-200'>
                <div>
                  <div className='text-xl font-semibold text-gray-900'>
                    {orders.filter((o) => o.status === "delivered").length}
                  </div>
                  <div className='text-sm text-gray-500'>Delivered</div>
                </div>
                <div>
                  <div className='text-xl font-semibold text-gray-900'>
                    {orders.filter((o) => o.status === "cancelled").length}
                  </div>
                  <div className='text-sm text-gray-500'>Cancelled</div>
                </div>
              </div>

              <div className='pt-4 border-t border-gray-200'>
                <div className='text-xl font-semibold text-gray-900'>
                  {formatCurrency(
                    orders.reduce((sum, order) => sum + (order.total || 0), 0)
                  )}
                </div>
                <div className='text-sm text-gray-500'>Total Spent</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* User Orders */}
      <Card title='Order History' subtitle={`${orders.length} orders placed`}>
        <Table
          columns={orderColumns}
          data={orders}
          loading={loadingOrders}
          onRowClick={(order) => navigate(`/orders/${order._id}`)}
          emptyMessage='No orders found'
        />
      </Card>
    </div>
  );
};

export default UserDetail;
