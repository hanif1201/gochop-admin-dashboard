import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaStar,
  FaStarHalf,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaMoneyBillWave,
  FaClock,
  FaMotorcycle,
  FaUtensils,
  FaTags,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import useAlert from "../../hooks/useAlert";
import restaurantService from "../../api/restaurants";
import menuService from "../../api/menu";
import { formatDate, formatCurrency } from "../../utils/formatter";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useAlert();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    averageOrderValue: 0,
    ordersThisMonth: 0,
  });

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoadingRestaurant(true);
        const response = await restaurantService.getRestaurant(id);

        if (response.success) {
          setRestaurant(response.data);

          // Fetch analytics data for the restaurant
          const analyticsResponse = await restaurantService.getAnalytics(id);
          if (analyticsResponse.success) {
            setStats(analyticsResponse.data);
          }
        } else {
          error("Failed to fetch restaurant details");
          navigate("/restaurants");
        }
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        error("An error occurred while fetching restaurant data");
        navigate("/restaurants");
      } finally {
        setLoadingRestaurant(false);
      }
    };

    fetchRestaurantData();
  }, [id, navigate, error]);

  // Fetch restaurant menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoadingMenu(true);
        const response = await menuService.getMenuItems(id);

        if (response.success) {
          setMenuItems(response.data);
        } else {
          error("Failed to fetch menu items");
        }
      } catch (err) {
        console.error("Error fetching menu items:", err);
        error("An error occurred while fetching menu data");
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenuItems();
  }, [id, error]);

  // Handle restaurant toggle status
  const handleToggleStatus = async () => {
    try {
      const response = await restaurantService.toggleStatus(id);

      if (response.success) {
        // Update the restaurant status in the state
        setRestaurant({
          ...restaurant,
          status: restaurant.status === "open" ? "closed" : "open",
        });

        success(
          `Restaurant is now ${
            restaurant.status === "open" ? "closed" : "open"
          }`
        );
      } else {
        error("Failed to update restaurant status");
      }
    } catch (err) {
      console.error("Error toggling restaurant status:", err);
      error(err.message || "Failed to update restaurant status");
    }
  };

  // Handle restaurant deletion
  const handleDeleteRestaurant = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this restaurant? This action cannot be undone."
      )
    ) {
      try {
        const response = await restaurantService.deleteRestaurant(id);

        if (response.success) {
          success("Restaurant deleted successfully");
          navigate("/restaurants");
        } else {
          error("Failed to delete restaurant");
        }
      } catch (err) {
        console.error("Error deleting restaurant:", err);
        error(err.message || "Failed to delete restaurant");
      }
    }
  };

  // Render star ratings
  const renderStars = (rating) => {
    if (!rating || isNaN(rating)) return "No ratings yet";

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className='flex items-center'>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className='text-yellow-400' />
        ))}
        {hasHalfStar && <FaStarHalf className='text-yellow-400' />}
        <span className='ml-1 text-gray-600 text-sm'>
          {rating.toFixed(1)} ({restaurant.ratingCount || 0} reviews)
        </span>
      </div>
    );
  };

  // Menu item table columns
  const menuColumns = [
    {
      header: "Item",
      accessor: "name",
      render: (item) => (
        <div className='flex items-center'>
          <div className='h-10 w-10 flex-shrink-0'>
            <img
              className='h-10 w-10 rounded-md object-cover'
              src={item.image || "https://via.placeholder.com/40"}
              alt={item.name}
            />
          </div>
          <div className='ml-4'>
            <div className='font-medium text-gray-900'>{item.name}</div>
            <div className='text-gray-500 text-xs'>{item.category}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (item) => formatCurrency(item.price),
    },
    {
      header: "Description",
      accessor: "description",
      render: (item) => (
        <div className='text-gray-500 truncate max-w-xs'>
          {item.description || "No description"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "available",
      render: (item) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.available
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.available ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (item) => (
        <div className='flex items-center space-x-2'>
          <Button
            variant='text'
            size='xs'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/menu/edit/${item._id}`);
            }}
            title='Edit Item'
          >
            <FaEdit className='text-blue-600' />
          </Button>
        </div>
      ),
    },
  ];

  if (loadingRestaurant) {
    return (
      <div className='flex justify-center items-center h-64'>
        <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
        <span className='ml-2 text-gray-600'>Loading restaurant data...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className='text-center p-8'>
        <h2 className='text-2xl font-semibold text-gray-900'>
          Restaurant not found
        </h2>
        <p className='mt-2 text-gray-600'>
          The restaurant you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant='primary'
          className='mt-4'
          onClick={() => navigate("/restaurants")}
        >
          Back to Restaurants
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
              onClick={() => navigate("/restaurants")}
            >
              <FaArrowLeft className='mr-1' /> Back
            </Button>
            <h1 className='text-2xl font-bold text-gray-900'>
              {restaurant.name}
            </h1>
          </div>
          <p className='mt-1 text-sm text-gray-500 flex items-center'>
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                restaurant.status === "open" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            {restaurant.status === "open" ? "Open" : "Closed"} ·{" "}
            {restaurant.cuisineType && restaurant.cuisineType.join(", ")}
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex space-x-2'>
          <Button
            variant={restaurant.status === "open" ? "outline" : "primary"}
            size='sm'
            onClick={handleToggleStatus}
          >
            {restaurant.status === "open" ? (
              <>
                <FaToggleOff className='mr-1' /> Mark as Closed
              </>
            ) : (
              <>
                <FaToggleOn className='mr-1' /> Mark as Open
              </>
            )}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate(`/restaurants/edit/${id}`)}
          >
            <FaEdit className='mr-1' /> Edit
          </Button>
          <Button variant='danger' size='sm' onClick={handleDeleteRestaurant}>
            <FaTrash className='mr-1' /> Delete
          </Button>
        </div>
      </div>

      {/* Restaurant Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Restaurant Cover Image */}
        <div className='md:col-span-2'>
          <Card noPadding>
            <div className='relative h-64'>
              <img
                src={
                  restaurant.coverImage || "https://via.placeholder.com/800x300"
                }
                alt={restaurant.name}
                className='w-full h-full object-cover'
              />
              <div className='absolute bottom-4 left-4 bg-white rounded-full p-1 shadow-md'>
                <img
                  src={restaurant.logo || "https://via.placeholder.com/100"}
                  alt='Logo'
                  className='h-16 w-16 rounded-full object-cover border-2 border-white'
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Restaurant Stats */}
        <div className='md:col-span-1'>
          <Card title='Restaurant Stats'>
            <div className='space-y-4'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Total Orders:</span>
                <span className='font-medium'>{stats.totalOrders || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Revenue:</span>
                <span className='font-medium'>
                  {formatCurrency(stats.revenue || 0)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Avg. Order Value:</span>
                <span className='font-medium'>
                  {formatCurrency(stats.averageOrderValue || 0)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Orders This Month:</span>
                <span className='font-medium'>
                  {stats.ordersThisMonth || 0}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Rating:</span>
                <span>{renderStars(restaurant.averageRating)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Details & Menu */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Restaurant Details */}
        <div className='md:col-span-1'>
          <Card title='Restaurant Details'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaMapMarkerAlt className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Address</p>
                  <p className='text-gray-500'>
                    {restaurant.address?.street}, {restaurant.address?.city},{" "}
                    {restaurant.address?.state} {restaurant.address?.postalCode}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaPhone className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Phone</p>
                  <p className='text-gray-500'>{restaurant.phone}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaEnvelope className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Email</p>
                  <p className='text-gray-500'>{restaurant.email}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaMoneyBillWave className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Delivery Fee</p>
                  <p className='text-gray-500'>
                    {formatCurrency(restaurant.deliveryFee || 0)}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaMoneyBillWave className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Minimum Order</p>
                  <p className='text-gray-500'>
                    {formatCurrency(restaurant.minOrderAmount || 0)}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaMotorcycle className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Delivery Distance</p>
                  <p className='text-gray-500'>
                    {restaurant.maxDeliveryDistance} km
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaClock className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Preparation Time</p>
                  <p className='text-gray-500'>
                    {restaurant.averagePreparationTime} minutes
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FaGlobe className='h-5 w-5 text-gray-400' />
                </div>
                <div className='ml-3 text-sm'>
                  <p className='text-gray-900 font-medium'>Created</p>
                  <p className='text-gray-500'>
                    {formatDate(restaurant.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Cuisine Types */}
          <Card title='Cuisine Types' className='mt-6'>
            <div className='flex flex-wrap gap-2'>
              {restaurant.cuisineType?.map((cuisine) => (
                <span
                  key={cuisine}
                  className='inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800'
                >
                  <FaTags className='mr-1 h-3 w-3' />
                  {cuisine}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Menu Items */}
        <div className='md:col-span-2'>
          <Card
            title='Menu Items'
            headerClassName='flex justify-between items-center'
            subtitle={
              <Link to={`/menu/add?restaurant=${id}`}>
                <Button variant='primary' size='sm'>
                  <FaUtensils className='mr-1' /> Add Menu Item
                </Button>
              </Link>
            }
          >
            <Table
              columns={menuColumns}
              data={menuItems}
              loading={loadingMenu}
              onRowClick={(item) => navigate(`/menu/${item._id}`)}
              emptyMessage='No menu items found'
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
