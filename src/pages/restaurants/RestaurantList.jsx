import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import restaurantService from "../../api/restaurants";
import { formatDate } from "../../utils/formatter";

const RestaurantList = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();

  // State variables
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    cuisine: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch restaurants data
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = {};
        if (filters.status) queryParams.status = filters.status;
        if (filters.cuisine) queryParams.cuisine = filters.cuisine;

        const response = await restaurantService.getRestaurants(queryParams);

        if (response.success) {
          setRestaurants(response.data);
        } else {
          error("Failed to fetch restaurants");
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        error(err.message || "Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [error, filters]);

  // Handle restaurant toggle status
  const handleToggleStatus = async (restaurantId) => {
    try {
      const response = await restaurantService.toggleStatus(restaurantId);

      if (response.success) {
        // Update the restaurant status in the state
        setRestaurants(
          restaurants.map((restaurant) =>
            restaurant._id === restaurantId
              ? {
                  ...restaurant,
                  status: restaurant.status === "open" ? "closed" : "open",
                }
              : restaurant
          )
        );

        success("Restaurant status updated successfully");
      } else {
        error("Failed to update restaurant status");
      }
    } catch (err) {
      console.error("Error toggling restaurant status:", err);
      error(err.message || "Failed to update restaurant status");
    }
  };

  // Handle restaurant deletion
  const handleDeleteRestaurant = async (restaurantId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this restaurant? This action cannot be undone."
      )
    ) {
      try {
        const response = await restaurantService.deleteRestaurant(restaurantId);

        if (response.success) {
          // Remove the restaurant from the state
          setRestaurants(
            restaurants.filter((restaurant) => restaurant._id !== restaurantId)
          );
          success("Restaurant deleted successfully");
        } else {
          error("Failed to delete restaurant");
        }
      } catch (err) {
        console.error("Error deleting restaurant:", err);
        error(err.message || "Failed to delete restaurant");
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

  // Filter restaurants based on search term
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.email &&
        restaurant.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (restaurant.phone && restaurant.phone.includes(searchTerm))
  );

  // Table columns definition
  const columns = [
    {
      header: "Restaurant",
      accessor: "name",
      render: (row) => (
        <div className='flex items-center'>
          <div className='h-10 w-10 flex-shrink-0'>
            <img
              className='h-10 w-10 rounded-full object-cover'
              src={row.logo || "https://via.placeholder.com/40"}
              alt={`${row.name} logo`}
            />
          </div>
          <div className='ml-4'>
            <div className='font-medium text-gray-900'>{row.name}</div>
            <div className='text-gray-500'>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === "open"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status === "open" ? "Open" : "Closed"}
        </span>
      ),
    },
    {
      header: "Cuisine",
      accessor: "cuisineType",
      render: (row) => (
        <div className='max-w-xs truncate'>
          {row.cuisineType && row.cuisineType.length > 0
            ? row.cuisineType.slice(0, 2).join(", ") +
              (row.cuisineType.length > 2 ? "..." : "")
            : "N/A"}
        </div>
      ),
    },
    {
      header: "Rating",
      accessor: "averageRating",
      render: (row) => (
        <div className='flex items-center'>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(row.averageRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
              </svg>
            ))}
          </div>
          <span className='ml-1 text-gray-500 text-sm'>
            {row.averageRating ? row.averageRating.toFixed(1) : "N/A"}
            {row.ratingCount ? ` (${row.ratingCount})` : ""}
          </span>
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (row) =>
        formatDate(row.createdAt, {
          day: "numeric",
          month: "short",
          year: "numeric",
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
              handleToggleStatus(row._id);
            }}
            title={row.status === "open" ? "Mark as Closed" : "Mark as Open"}
          >
            {row.status === "open" ? (
              <FaTimes className='text-gray-500' />
            ) : (
              <FaCheck className='text-green-600' />
            )}
          </Button>

          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/restaurants/edit/${row._id}`);
            }}
            title='Edit Restaurant'
          >
            <FaEdit className='text-blue-600' />
          </Button>

          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRestaurant(row._id);
            }}
            title='Delete Restaurant'
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
          <h1 className='text-2xl font-bold text-gray-900'>Restaurants</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Manage all restaurants in the system
          </p>
        </div>
        <div className='mt-4 md:mt-0'>
          <Link to='/restaurants/add'>
            <Button variant='primary'>
              <FaPlus className='mr-2' /> Add Restaurant
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
              placeholder='Search restaurants by name, email, or phone'
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
                <option value='open'>Open</option>
                <option value='closed'>Closed</option>
                <option value='busy'>Busy</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='cuisine'
                className='block text-sm font-medium text-gray-700'
              >
                Cuisine Type
              </label>
              <select
                id='cuisine'
                name='cuisine'
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                value={filters.cuisine}
                onChange={handleFilterChange}
              >
                <option value=''>All Cuisines</option>
                <option value='Italian'>Italian</option>
                <option value='Chinese'>Chinese</option>
                <option value='Indian'>Indian</option>
                <option value='Mexican'>Mexican</option>
                <option value='Thai'>Thai</option>
                <option value='Japanese'>Japanese</option>
                <option value='American'>American</option>
                <option value='Fast Food'>Fast Food</option>
              </select>
            </div>

            <div className='flex items-end'>
              <Button
                variant='outline'
                onClick={() => setFilters({ status: "", cuisine: "" })}
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
        data={filteredRestaurants}
        loading={loading}
        onRowClick={(restaurant) => navigate(`/restaurants/${restaurant._id}`)}
        emptyMessage='No restaurants found'
      />
    </div>
  );
};

export default RestaurantList;
