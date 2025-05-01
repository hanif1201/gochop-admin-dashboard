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
  FaUtensils,
} from "react-icons/fa";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import menuService from "../../api/menu";
import { formatCurrency } from "../../utils/formatter";

const MenuList = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();

  // State variables
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    restaurant: "",
    availability: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch menu items data
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = {};
        if (filters.category) queryParams.category = filters.category;
        if (filters.restaurant) queryParams.restaurant = filters.restaurant;
        if (filters.availability)
          queryParams.available = filters.availability === "available";

        const response = await menuService.getMenuItems(null, queryParams);

        if (response.success) {
          setMenuItems(response.data);
        } else {
          error("Failed to fetch menu items");
        }
      } catch (err) {
        console.error("Error fetching menu items:", err);
        error(err.message || "Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [error, filters]);

  // Handle menu item availability toggle
  const handleToggleAvailability = async (itemId) => {
    try {
      const response = await menuService.toggleAvailability(itemId);

      if (response.success) {
        // Update the menu item in the state
        setMenuItems(
          menuItems.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  available: !item.available,
                }
              : item
          )
        );

        success("Menu item availability updated successfully");
      } else {
        error("Failed to update menu item availability");
      }
    } catch (err) {
      console.error("Error toggling menu item availability:", err);
      error(err.message || "Failed to update menu item availability");
    }
  };

  // Handle menu item deletion
  const handleDeleteMenuItem = async (itemId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone."
      )
    ) {
      try {
        const response = await menuService.deleteMenuItem(itemId);

        if (response.success) {
          // Remove the menu item from the state
          setMenuItems(menuItems.filter((item) => item._id !== itemId));
          success("Menu item deleted successfully");
        } else {
          error("Failed to delete menu item");
        }
      } catch (err) {
        console.error("Error deleting menu item:", err);
        error(err.message || "Failed to delete menu item");
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

  // Filter menu items based on search term
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category &&
        item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique categories for filter dropdown
  const categories = [
    ...new Set(menuItems.map((item) => item.category)),
  ].filter(Boolean);

  // Table columns definition
  const columns = [
    {
      header: "Item",
      accessor: "name",
      render: (row) => (
        <div className='flex items-center'>
          <div className='h-10 w-10 flex-shrink-0'>
            <img
              className='h-10 w-10 rounded-md object-cover'
              src={row.image || "https://via.placeholder.com/40"}
              alt={row.name}
            />
          </div>
          <div className='ml-4'>
            <div className='font-medium text-gray-900'>{row.name}</div>
            <div className='text-gray-500 text-xs'>{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Restaurant",
      accessor: "restaurant.name",
      render: (row) => (
        <div className='flex items-center'>
          {row.restaurant ? (
            <>
              <div className='h-8 w-8 flex-shrink-0'>
                <img
                  className='h-8 w-8 rounded-full object-cover'
                  src={row.restaurant.logo || "https://via.placeholder.com/30"}
                  alt={row.restaurant.name}
                />
              </div>
              <div className='ml-3 text-sm font-medium text-gray-900'>
                {row.restaurant.name}
              </div>
            </>
          ) : (
            <span className='text-gray-500'>Unknown</span>
          )}
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (row) => formatCurrency(row.price),
    },
    {
      header: "Status",
      accessor: "available",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.available
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.available ? "Available" : "Unavailable"}
        </span>
      ),
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
              handleToggleAvailability(row._id);
            }}
            title={row.available ? "Mark as Unavailable" : "Mark as Available"}
          >
            {row.available ? (
              <FaToggleOn className='text-green-600' />
            ) : (
              <FaToggleOff className='text-gray-500' />
            )}
          </Button>

          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/menu/edit/${row._id}`);
            }}
            title='Edit Menu Item'
          >
            <FaEdit className='text-blue-600' />
          </Button>

          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMenuItem(row._id);
            }}
            title='Delete Menu Item'
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
          <h1 className='text-2xl font-bold text-gray-900'>Menu Items</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Manage all menu items in the system
          </p>
        </div>
        <div className='mt-4 md:mt-0'>
          <Link to='/menu/add'>
            <Button variant='primary'>
              <FaPlus className='mr-2' /> Add Menu Item
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
              placeholder='Search menu items by name, description, or category'
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
                htmlFor='category'
                className='block text-sm font-medium text-gray-700'
              >
                Category
              </label>
              <select
                id='category'
                name='category'
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value=''>All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
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
                onClick={() =>
                  setFilters({ category: "", restaurant: "", availability: "" })
                }
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
        data={filteredMenuItems}
        loading={loading}
        onRowClick={(item) => navigate(`/menu/${item._id}`)}
        emptyMessage='No menu items found'
      />
    </div>
  );
};

export default MenuList;
