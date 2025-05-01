import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaStar,
  FaUtensils,
  FaDollarSign,
  FaTag,
  FaPizzaSlice,
  FaStopwatch,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaImage,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import menuService from "../../api/menu";
import { formatCurrency } from "../../utils/formatter";

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useAlert();

  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch menu item data
  useEffect(() => {
    const fetchMenuItemData = async () => {
      try {
        setLoading(true);
        const response = await menuService.getMenuItem(id);

        if (response.success) {
          setMenuItem(response.data);
        } else {
          error("Failed to fetch menu item details");
          navigate("/menu");
        }
      } catch (err) {
        console.error("Error fetching menu item:", err);
        error("An error occurred while fetching menu item data");
        navigate("/menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItemData();
  }, [id, navigate, error]);

  // Handle menu item availability toggle
  const handleToggleAvailability = async () => {
    try {
      const response = await menuService.toggleAvailability(id);

      if (response.success) {
        setMenuItem({
          ...menuItem,
          available: !menuItem.available,
        });
        success(
          `Menu item is now ${
            !menuItem.available ? "available" : "unavailable"
          }`
        );
      } else {
        error("Failed to update menu item availability");
      }
    } catch (err) {
      console.error("Error toggling menu item availability:", err);
      error(err.message || "Failed to update menu item availability");
    }
  };

  // Handle menu item deletion
  const handleDeleteMenuItem = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this menu item? This action cannot be undone."
      )
    ) {
      try {
        const response = await menuService.deleteMenuItem(id);

        if (response.success) {
          success("Menu item deleted successfully");
          navigate("/menu");
        } else {
          error("Failed to delete menu item");
        }
      } catch (err) {
        console.error("Error deleting menu item:", err);
        error(err.message || "Failed to delete menu item");
      }
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const response = await menuService.uploadImage(id, file);

      if (response.success) {
        setMenuItem({
          ...menuItem,
          image: response.data.image,
        });
        success("Image uploaded successfully");
      } else {
        error("Failed to upload image");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      error(err.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
        <span className='ml-2 text-gray-600'>Loading menu item data...</span>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className='text-center p-8'>
        <h2 className='text-2xl font-semibold text-gray-900'>
          Menu item not found
        </h2>
        <p className='mt-2 text-gray-600'>
          The menu item you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant='primary'
          className='mt-4'
          onClick={() => navigate("/menu")}
        >
          Back to Menu Items
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
              onClick={() => navigate("/menu")}
            >
              <FaArrowLeft className='mr-1' /> Back
            </Button>
            <h1 className='text-2xl font-bold text-gray-900'>
              {menuItem.name}
            </h1>
          </div>
          <p className='mt-1 text-sm text-gray-500 flex items-center'>
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                menuItem.available ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            {menuItem.available ? "Available" : "Unavailable"} ·{" "}
            {menuItem.category}
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex flex-wrap gap-2'>
          <Button
            variant={menuItem.available ? "outline" : "primary"}
            size='sm'
            onClick={handleToggleAvailability}
          >
            {menuItem.available ? (
              <>
                <FaToggleOff className='mr-1' /> Mark as Unavailable
              </>
            ) : (
              <>
                <FaToggleOn className='mr-1' /> Mark as Available
              </>
            )}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate(`/menu/edit/${id}`)}
          >
            <FaEdit className='mr-1' /> Edit
          </Button>
          <Button variant='danger' size='sm' onClick={handleDeleteMenuItem}>
            <FaTrash className='mr-1' /> Delete
          </Button>
        </div>
      </div>

      {/* Menu Item Details */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Left Column - Image */}
        <div className='md:col-span-1'>
          <Card noPadding>
            <div className='relative'>
              <div className='h-64 w-full bg-gray-100 flex items-center justify-center'>
                {menuItem.image ? (
                  <img
                    src={menuItem.image}
                    alt={menuItem.name}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='text-center p-4'>
                    <FaImage className='mx-auto h-12 w-12 text-gray-400' />
                    <p className='mt-2 text-sm text-gray-500'>
                      No image available
                    </p>
                  </div>
                )}
              </div>
              <div className='absolute bottom-4 right-4'>
                <label className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-900 bg-opacity-70 hover:bg-opacity-90 cursor-pointer'>
                  <FaImage className='mr-2' />
                  {imageUploading ? "Uploading..." : "Change Image"}
                  <input
                    type='file'
                    className='hidden'
                    accept='image/*'
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                </label>
              </div>
            </div>
          </Card>

          {/* Price & Category Info */}
          <Card className='mt-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center text-gray-500'>
                  <FaDollarSign className='mr-2' />
                  <span>Price</span>
                </div>
                <span className='text-xl font-bold text-gray-900'>
                  {formatCurrency(menuItem.price)}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center text-gray-500'>
                  <FaTag className='mr-2' />
                  <span>Category</span>
                </div>
                <span className='px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800'>
                  {menuItem.category}
                </span>
              </div>

              {menuItem.preparationTime && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center text-gray-500'>
                    <FaStopwatch className='mr-2' />
                    <span>Preparation Time</span>
                  </div>
                  <span className='text-gray-900'>
                    {menuItem.preparationTime} mins
                  </span>
                </div>
              )}

              {menuItem.calories && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center text-gray-500'>
                    <FaPizzaSlice className='mr-2' />
                    <span>Calories</span>
                  </div>
                  <span className='text-gray-900'>{menuItem.calories} cal</span>
                </div>
              )}

              {menuItem.ratings && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center text-gray-500'>
                    <FaStar className='mr-2' />
                    <span>Rating</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='flex'>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(menuItem.ratings?.average || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className='ml-1 text-sm text-gray-500'>
                      ({menuItem.ratings?.count || 0})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Restaurant Info */}
          {menuItem.restaurant && (
            <Card title='Restaurant' className='mt-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <img
                    className='h-12 w-12 rounded-full object-cover'
                    src={
                      menuItem.restaurant.logo ||
                      "https://via.placeholder.com/48"
                    }
                    alt={menuItem.restaurant.name}
                  />
                </div>
                <div className='ml-4'>
                  <h3 className='text-base font-medium text-gray-900'>
                    {menuItem.restaurant.name}
                  </h3>
                  <Link
                    to={`/restaurants/${menuItem.restaurant._id}`}
                    className='text-sm text-primary-600 hover:text-primary-800'
                  >
                    View Restaurant
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div className='md:col-span-2'>
          <Card title='Description'>
            <p className='text-gray-700'>
              {menuItem.description || "No description available."}
            </p>
          </Card>

          {/* Ingredients */}
          <Card title='Ingredients' className='mt-6'>
            {menuItem.ingredients && menuItem.ingredients.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {menuItem.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800'
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No ingredients listed.</p>
            )}
          </Card>

          {/* Options & Variations */}
          <Card title='Options & Variations' className='mt-6'>
            {menuItem.options && menuItem.options.length > 0 ? (
              <div className='space-y-6'>
                {menuItem.options.map((option, index) => (
                  <div key={index}>
                    <h4 className='text-base font-medium text-gray-900 mb-2'>
                      {option.name}
                      {option.required && (
                        <span className='ml-2 text-xs text-red-600'>
                          (Required)
                        </span>
                      )}
                    </h4>
                    <div className='bg-gray-50 p-4 rounded-md'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {option.choices.map((choice, choiceIndex) => (
                          <div
                            key={choiceIndex}
                            className='flex justify-between items-center border-b border-gray-200 pb-2'
                          >
                            <span className='text-sm text-gray-700'>
                              {choice.name}
                            </span>
                            {choice.price > 0 && (
                              <span className='text-sm font-medium text-gray-900'>
                                +{formatCurrency(choice.price)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>
                No options or variations available.
              </p>
            )}
          </Card>

          {/* Sales Statistics */}
          <Card title='Sales Statistics' className='mt-6'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='bg-blue-50 p-4 rounded-md'>
                <div className='text-sm font-medium text-blue-800 mb-1'>
                  Total Orders
                </div>
                <div className='text-2xl font-bold text-blue-900'>
                  {menuItem.stats?.totalOrders || 0}
                </div>
              </div>

              <div className='bg-green-50 p-4 rounded-md'>
                <div className='text-sm font-medium text-green-800 mb-1'>
                  Total Revenue
                </div>
                <div className='text-2xl font-bold text-green-900'>
                  {formatCurrency(menuItem.stats?.totalRevenue || 0)}
                </div>
              </div>

              <div className='bg-purple-50 p-4 rounded-md'>
                <div className='text-sm font-medium text-purple-800 mb-1'>
                  Last 30 Days
                </div>
                <div className='text-2xl font-bold text-purple-900'>
                  {menuItem.stats?.last30Days || 0} orders
                </div>
              </div>
            </div>

            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='text-sm text-gray-500'>
                This item was added on{" "}
                {new Date(menuItem.createdAt).toLocaleDateString()} and last
                updated on {new Date(menuItem.updatedAt).toLocaleDateString()}.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MenuDetail;
