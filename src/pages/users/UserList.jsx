import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaUserSlash,
  FaUserCheck,
} from "react-icons/fa";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import userService from "../../api/users";
import { formatDate } from "../../utils/formatter";

const UserList = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();

  // State variables
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = {};
        if (filters.role) queryParams.role = filters.role;
        if (filters.status) queryParams.status = filters.status;

        const response = await userService.getUsers(queryParams);

        if (response.success) {
          setUsers(response.data);
        } else {
          error("Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        error(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [error, filters]);

  // Handle user status toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await userService.updateUser(userId, {
        status: newStatus,
      });

      if (response.success) {
        // Update the user status in the state
        setUsers(
          users.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  status: newStatus,
                }
              : user
          )
        );

        success(`User status updated to ${newStatus}`);
      } else {
        error("Failed to update user status");
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      error(err.message || "Failed to update user status");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        const response = await userService.deleteUser(userId);

        if (response.success) {
          // Remove the user from the state
          setUsers(users.filter((user) => user._id !== userId));
          success("User deleted successfully");
        } else {
          error("Failed to delete user");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        error(err.message || "Failed to delete user");
      }
    }
  };

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
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm))
  );

  // Table columns definition
  const columns = [
    {
      header: "User",
      accessor: "name",
      render: (row) => (
        <div className='flex items-center'>
          <div className='h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden'>
            {row.avatar ? (
              <img
                className='h-10 w-10 rounded-full object-cover'
                src={row.avatar}
                alt={row.name}
              />
            ) : (
              <span className='text-gray-500 font-medium'>
                {row.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className='ml-4'>
            <div className='font-medium text-gray-900'>{row.name}</div>
            <div className='text-gray-500'>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      render: (row) => {
        const roleColors = {
          admin: "bg-purple-100 text-purple-800",
          restaurant: "bg-blue-100 text-blue-800",
          rider: "bg-green-100 text-green-800",
          customer: "bg-gray-100 text-gray-800",
        };

        const roleClass = roleColors[row.role] || "bg-gray-100 text-gray-800";
        const formattedRole =
          row.role.charAt(0).toUpperCase() + row.role.slice(1);

        return (
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClass}`}
          >
            {formattedRole}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : row.status === "suspended"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      render: (row) => row.phone || "N/A",
    },
    {
      header: "Joined",
      accessor: "createdAt",
      render: (row) =>
        formatDate(row.createdAt, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: undefined,
          minute: undefined,
        }),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className='flex items-center space-x-2'>
          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row._id, row.status);
            }}
            title={
              row.status === "active" ? "Deactivate User" : "Activate User"
            }
          >
            {row.status === "active" ? (
              <FaUserSlash className='text-gray-500' />
            ) : (
              <FaUserCheck className='text-green-600' />
            )}
          </Button>

          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/edit/${row._id}`);
            }}
            title='Edit User'
          >
            <FaEdit className='text-blue-600' />
          </Button>

          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(row._id);
            }}
            title='Delete User'
          >
            <FaTrash className='text-red-600' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Users</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Manage all users in the system
          </p>
        </div>
        <div className='mt-4 md:mt-0'>
          <Link to='/users/add'>
            <Button variant='primary'>
              <FaPlus className='mr-2' /> Add User
            </Button>
          </Link>
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
              placeholder='Search users by name, email, or phone'
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
                htmlFor='role'
                className='block text-sm font-medium text-gray-700'
              >
                Role
              </label>
              <select
                id='role'
                name='role'
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                value={filters.role}
                onChange={handleFilterChange}
              >
                <option value=''>All Roles</option>
                <option value='admin'>Admin</option>
                <option value='restaurant'>Restaurant Manager</option>
                <option value='rider'>Delivery Rider</option>
                <option value='customer'>Customer</option>
              </select>
            </div>

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
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
                <option value='suspended'>Suspended</option>
              </select>
            </div>

            <div className='flex items-end'>
              <Button
                variant='outline'
                onClick={() => setFilters({ role: "", status: "" })}
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
        data={filteredUsers}
        loading={loading}
        onRowClick={(user) => navigate(`/users/${user._id}`)}
        emptyMessage='No users found'
      />
    </div>
  );
};

export default UserList;
