import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaMotorcycle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import riderService from "../../api/riders";
import { formatDate } from "../../utils/formatter";

const RiderList = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();

  // State variables
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    availability: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch riders data
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = {};
        if (filters.status) queryParams.status = filters.status;
        if (filters.availability)
          queryParams.availability = filters.availability;

        const response = await riderService.getRiders(queryParams);

        if (response.success) {
          setRiders(response.data);
        } else {
          error("Failed to fetch riders");
        }
      } catch (err) {
        console.error("Error fetching riders:", err);
        error(err.message || "Failed to load riders");
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, [error, filters]);

  // Handle rider status toggle
  const handleToggleStatus = async (riderId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await riderService.updateRider(riderId, {
        status: newStatus,
      });

      if (response.success) {
        // Update the rider status in the state
        setRiders(
          riders.map((rider) =>
            rider._id === riderId
              ? {
                  ...rider,
                  status: newStatus,
                }
              : rider
          )
        );

        success(`Rider status updated to ${newStatus}`);
      } else {
        error("Failed to update rider status");
      }
    } catch (err) {
      console.error("Error toggling rider status:", err);
      error(err.message || "Failed to update rider status");
    }
  };

  // Handle rider deletion
  const handleDeleteRider = async (riderId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this rider? This action cannot be undone."
      )
    ) {
      try {
        const response = await riderService.deleteRider(riderId);

        if (response.success) {
          // Remove the rider from the state
          setRiders(riders.filter((rider) => rider._id !== riderId));
          success("Rider deleted successfully");
        } else {
          error("Failed to delete rider");
        }
      } catch (err) {
        console.error("Error deleting rider:", err);
        error(err.message || "Failed to delete rider");
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

  // Filter riders based on search term
  const filteredRiders = riders.filter(
    (rider) =>
      rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rider.email &&
        rider.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rider.phone && rider.phone.includes(searchTerm))
  );

  // Table columns definition
  const columns = [
    {
      header: "Rider",
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
              <FaMotorcycle className='h-5 w-5 text-gray-400' />
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
      header: "Phone",
      accessor: "phone",
      render: (row) => row.phone || "N/A",
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Availability",
      accessor: "isAvailable",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.isAvailable
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.isAvailable ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      header: "Current Location",
      accessor: "currentLocation",
      render: (row) => {
        if (row.currentLocation && row.currentLocation.coordinates) {
          return (
            <div className='flex items-center'>
              <FaMapMarkerAlt className='text-red-500 mr-1' />
              <span className='text-gray-500 text-sm'>
                {row.currentLocation.coordinates[1].toFixed(4)},{" "}
                {row.currentLocation.coordinates[0].toFixed(4)}
              </span>
            </div>
          );
        }
        return "No location data";
      },
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
              row.status === "active" ? "Deactivate Rider" : "Activate Rider"
            }
          >
            {row.status === "active" ? (
              <FaToggleOff className='text-gray-500' />
            ) : (
              <FaToggleOn className='text-green-600' />
            )}
          </Button>

          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/riders/edit/${row._id}`);
            }}
            title='Edit Rider'
          >
            <FaEdit className='text-blue-600' />
          </Button>

          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRider(row._id);
            }}
            title='Delete Rider'
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
          <h1 className='text-2xl font-bold text-gray-900'>Delivery Riders</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Manage all delivery riders in the system
          </p>
        </div>
        <div className='mt-4 md:mt-0'>
          <Link to='/riders/add'>
            <Button variant='primary'>
              <FaPlus className='mr-2' /> Add Rider
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
              placeholder='Search riders by name, email, or phone'
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
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
                <option value='suspended'>Suspended</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='availability'
                className='block text-sm font-medium text-gray-700'
              >
                Availability
              </label>
              <select
                id='availability'
                name='availability'
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                value={filters.availability}
                onChange={handleFilterChange}
              >
                <option value=''>All</option>
                <option value='available'>Available</option>
                <option value='unavailable'>Unavailable</option>
              </select>
            </div>

            <div className='flex items-end'>
              <Button
                variant='outline'
                onClick={() => setFilters({ status: "", availability: "" })}
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
        data={filteredRiders}
        loading={loading}
        onRowClick={(rider) => navigate(`/riders/${rider._id}`)}
        emptyMessage='No riders found'
      />
    </div>
  );
};

export default RiderList;
