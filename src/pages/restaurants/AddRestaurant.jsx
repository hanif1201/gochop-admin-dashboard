import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaUtensils,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTags,
  FaImage,
  FaArrowLeft,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import restaurantService from "../../api/restaurants";

const AddRestaurant = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States",
      },
      cuisineType: [],
      openingHours: {
        monday: { open: "09:00", close: "22:00", isOpen: true },
        tuesday: { open: "09:00", close: "22:00", isOpen: true },
        wednesday: { open: "09:00", close: "22:00", isOpen: true },
        thursday: { open: "09:00", close: "22:00", isOpen: true },
        friday: { open: "09:00", close: "23:00", isOpen: true },
        saturday: { open: "10:00", close: "23:00", isOpen: true },
        sunday: { open: "10:00", close: "22:00", isOpen: true },
      },
      deliveryFee: 2.5,
      minOrderAmount: 10,
      maxDeliveryDistance: 10,
      averagePreparationTime: 30,
      description: "",
      status: "open",
      logo: null,
      coverImage: null,
    },
  });

  // Watch for file inputs to create previews
  const logoFile = watch("logo");
  const coverFile = watch("coverImage");

  // Handle cuisine type selection
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const availableCuisines = [
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "Thai",
    "Japanese",
    "American",
    "Fast Food",
    "Vegetarian",
    "Seafood",
    "Mediterranean",
    "Middle Eastern",
    "Korean",
    "Vietnamese",
    "Greek",
    "French",
    "Spanish",
    "Caribbean",
  ];

  const toggleCuisine = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  // Handle logo image change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover image change
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Add selected cuisines to data
      data.cuisineType = selectedCuisines;

      // Create FormData for file uploads
      const formData = new FormData();

      // Append non-file fields to formData
      Object.keys(data).forEach((key) => {
        if (key !== "logo" && key !== "coverImage") {
          if (typeof data[key] === "object") {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Append files if they exist
      if (data.logo && data.logo[0]) {
        formData.append("logo", data.logo[0]);
      }

      if (data.coverImage && data.coverImage[0]) {
        formData.append("coverImage", data.coverImage[0]);
      }

      const response = await restaurantService.createRestaurant(formData);

      if (response.success) {
        success("Restaurant created successfully");
        navigate(`/restaurants/${response.data._id}`);
      } else {
        error(response.message || "Failed to create restaurant");
      }
    } catch (err) {
      console.error("Error creating restaurant:", err);
      error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Add Restaurant</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Create a new restaurant in the system
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => navigate("/restaurants")}
          className='flex items-center'
        >
          <FaArrowLeft className='mr-2' /> Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Basic Information */}
          <Card title='Basic Information' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* Restaurant Name */}
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700'
                >
                  Restaurant Name*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaUtensils className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    id='name'
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='Restaurant Name'
                    {...register("name", {
                      required: "Restaurant name is required",
                    })}
                  />
                </div>
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
                >
                  Email Address*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaEnvelope className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='email'
                    id='email'
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='restaurant@example.com'
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-gray-700'
                >
                  Phone Number*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaPhone className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='tel'
                    id='phone'
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='(123) 456-7890'
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-gray-700'
                >
                  Description
                </label>
                <div className='mt-1'>
                  <textarea
                    id='description'
                    rows={3}
                    className='shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                    placeholder='Brief description of the restaurant'
                    {...register("description")}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor='status'
                  className='block text-sm font-medium text-gray-700'
                >
                  Status
                </label>
                <select
                  id='status'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  {...register("status")}
                >
                  <option value='open'>Open</option>
                  <option value='closed'>Closed</option>
                  <option value='busy'>Busy</option>
                  <option value='maintenance'>Under Maintenance</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card title='Address Information' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* Street */}
              <div>
                <label
                  htmlFor='street'
                  className='block text-sm font-medium text-gray-700'
                >
                  Street Address*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaMapMarkerAlt className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    id='street'
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.address?.street
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='123 Main St'
                    {...register("address.street", {
                      required: "Street address is required",
                    })}
                  />
                </div>
                {errors.address?.street && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.address.street.message}
                  </p>
                )}
              </div>

              {/* City & State */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='city'
                    className='block text-sm font-medium text-gray-700'
                  >
                    City*
                  </label>
                  <input
                    type='text'
                    id='city'
                    className={`mt-1 block w-full border ${
                      errors.address?.city
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='City'
                    {...register("address.city", {
                      required: "City is required",
                    })}
                  />
                  {errors.address?.city && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.address.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='state'
                    className='block text-sm font-medium text-gray-700'
                  >
                    State*
                  </label>
                  <input
                    type='text'
                    id='state'
                    className={`mt-1 block w-full border ${
                      errors.address?.state
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='State'
                    {...register("address.state", {
                      required: "State is required",
                    })}
                  />
                  {errors.address?.state && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.address.state.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Postal Code & Country */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='postalCode'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Postal Code*
                  </label>
                  <input
                    type='text'
                    id='postalCode'
                    className={`mt-1 block w-full border ${
                      errors.address?.postalCode
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='12345'
                    {...register("address.postalCode", {
                      required: "Postal code is required",
                    })}
                  />
                  {errors.address?.postalCode && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.address.postalCode.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='country'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Country*
                  </label>
                  <select
                    id='country'
                    className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                    {...register("address.country", {
                      required: "Country is required",
                    })}
                  >
                    <option value='United States'>United States</option>
                    <option value='Canada'>Canada</option>
                    <option value='United Kingdom'>United Kingdom</option>
                    <option value='Australia'>Australia</option>
                    <option value='Other'>Other</option>
                  </select>
                  {errors.address?.country && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errors.address.country.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Images & Cuisine */}
          <Card title='Images & Cuisine' className='lg:col-span-1'>
            <div className='space-y-6'>
              {/* Logo Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Restaurant Logo
                </label>
                <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                  <div className='space-y-1 text-center'>
                    {logoPreview ? (
                      <div className='flex flex-col items-center'>
                        <img
                          src={logoPreview}
                          alt='Logo preview'
                          className='h-24 w-24 object-cover rounded-full'
                        />
                        <button
                          type='button'
                          className='mt-2 text-sm text-red-600 hover:text-red-700'
                          onClick={() => {
                            setLogoPreview(null);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaImage className='mx-auto h-12 w-12 text-gray-400' />
                        <div className='flex text-sm text-gray-600'>
                          <label
                            htmlFor='logo'
                            className='relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none'
                          >
                            <span>Upload logo</span>
                            <input
                              id='logo'
                              type='file'
                              className='sr-only'
                              accept='image/*'
                              {...register("logo")}
                              onChange={handleLogoChange}
                            />
                          </label>
                          <p className='pl-1'>or drag and drop</p>
                        </div>
                        <p className='text-xs text-gray-500'>
                          PNG, JPG, GIF up to 2MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Cover Image
                </label>
                <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                  <div className='space-y-1 text-center'>
                    {coverPreview ? (
                      <div className='flex flex-col items-center'>
                        <img
                          src={coverPreview}
                          alt='Cover preview'
                          className='h-32 w-full object-cover rounded-md'
                        />
                        <button
                          type='button'
                          className='mt-2 text-sm text-red-600 hover:text-red-700'
                          onClick={() => {
                            setCoverPreview(null);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaImage className='mx-auto h-12 w-12 text-gray-400' />
                        <div className='flex text-sm text-gray-600'>
                          <label
                            htmlFor='coverImage'
                            className='relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none'
                          >
                            <span>Upload cover</span>
                            <input
                              id='coverImage'
                              type='file'
                              className='sr-only'
                              accept='image/*'
                              {...register("coverImage")}
                              onChange={handleCoverChange}
                            />
                          </label>
                          <p className='pl-1'>or drag and drop</p>
                        </div>
                        <p className='text-xs text-gray-500'>
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Cuisine Types */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Cuisine Types*
                </label>
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                  {availableCuisines.map((cuisine) => (
                    <div
                      key={cuisine}
                      className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
                        selectedCuisines.includes(cuisine)
                          ? "bg-primary-100 border border-primary-300"
                          : "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleCuisine(cuisine)}
                    >
                      <FaTags
                        className={`mr-2 ${
                          selectedCuisines.includes(cuisine)
                            ? "text-primary-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          selectedCuisines.includes(cuisine)
                            ? "text-primary-700 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {cuisine}
                      </span>
                    </div>
                  ))}
                </div>
                {selectedCuisines.length === 0 && (
                  <p className='mt-1 text-sm text-red-600'>
                    Please select at least one cuisine type
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Delivery Settings */}
          <Card title='Delivery Settings' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* Delivery Fee */}
              <div>
                <label
                  htmlFor='deliveryFee'
                  className='block text-sm font-medium text-gray-700'
                >
                  Delivery Fee ($)
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaMoneyBillWave className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='number'
                    id='deliveryFee'
                    step='0.01'
                    min='0'
                    className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                    placeholder='2.50'
                    {...register("deliveryFee", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              {/* Min Order Amount */}
              <div>
                <label
                  htmlFor='minOrderAmount'
                  className='block text-sm font-medium text-gray-700'
                >
                  Minimum Order Amount ($)
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaMoneyBillWave className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='number'
                    id='minOrderAmount'
                    step='0.01'
                    min='0'
                    className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                    placeholder='10.00'
                    {...register("minOrderAmount", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              {/* Max Delivery Distance */}
              <div>
                <label
                  htmlFor='maxDeliveryDistance'
                  className='block text-sm font-medium text-gray-700'
                >
                  Maximum Delivery Distance (km)
                </label>
                <input
                  type='number'
                  id='maxDeliveryDistance'
                  step='0.1'
                  min='0.1'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  placeholder='10'
                  {...register("maxDeliveryDistance", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              {/* Average Preparation Time */}
              <div>
                <label
                  htmlFor='averagePreparationTime'
                  className='block text-sm font-medium text-gray-700'
                >
                  Average Preparation Time (minutes)
                </label>
                <input
                  type='number'
                  id='averagePreparationTime'
                  step='5'
                  min='5'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  placeholder='30'
                  {...register("averagePreparationTime", {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className='mt-6 flex justify-end space-x-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate("/restaurants")}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            loading={loading}
            disabled={loading || selectedCuisines.length === 0}
          >
            Create Restaurant
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurant;
