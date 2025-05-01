import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaUtensils,
  FaDollarSign,
  FaTag,
  FaImage,
  FaPizzaSlice,
  FaStopwatch,
  FaPlus,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import menuService from "../../api/menu";
import restaurantService from "../../api/restaurants";

const EditMenuItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [ingredientFields, setIngredientFields] = useState([{ value: "" }]);
  const [options, setOptions] = useState([
    { name: "", required: false, choices: [{ name: "", price: 0 }] },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  // Watch for file input to create preview
  const imageFile = watch("image");

  // Fetch menu item data
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        setFetchLoading(true);
        const response = await menuService.getMenuItem(id);

        if (response.success) {
          const menuItem = response.data;

          // Fetch restaurants for dropdown
          const restaurantsResponse = await restaurantService.getRestaurants();
          if (restaurantsResponse.success) {
            setRestaurants(restaurantsResponse.data);
          }

          // Set image preview if exists
          if (menuItem.image) {
            setImagePreview(menuItem.image);
          }

          // Set ingredients
          if (menuItem.ingredients && menuItem.ingredients.length > 0) {
            setIngredientFields(
              menuItem.ingredients.map((ingredient) => ({ value: ingredient }))
            );
          }

          // Set options
          if (menuItem.options && menuItem.options.length > 0) {
            setOptions(menuItem.options);
          } else {
            setOptions([
              { name: "", required: false, choices: [{ name: "", price: 0 }] },
            ]);
          }

          // Set form values
          reset({
            name: menuItem.name,
            description: menuItem.description || "",
            price: menuItem.price,
            restaurant: menuItem.restaurant._id,
            category: menuItem.category,
            preparationTime: menuItem.preparationTime || "",
            calories: menuItem.calories || "",
            available: menuItem.available,
          });
        } else {
          error("Failed to fetch menu item details");
          navigate("/menu");
        }
      } catch (err) {
        console.error("Error fetching menu item:", err);
        error("An error occurred while fetching menu item data");
        navigate("/menu");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchMenuItem();
  }, [id, navigate, reset, error]);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle ingredient fields
  const handleAddIngredient = () => {
    setIngredientFields([...ingredientFields, { value: "" }]);
  };

  const handleRemoveIngredient = (index) => {
    const newFields = [...ingredientFields];
    newFields.splice(index, 1);
    setIngredientFields(newFields);
  };

  const handleIngredientChange = (index, value) => {
    const newFields = [...ingredientFields];
    newFields[index].value = value;
    setIngredientFields(newFields);
  };

  // Handle options
  const handleAddOption = () => {
    setOptions([
      ...options,
      { name: "", required: false, choices: [{ name: "", price: 0 }] },
    ]);
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleAddChoice = (optionIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].choices.push({ name: "", price: 0 });
    setOptions(newOptions);
  };

  const handleRemoveChoice = (optionIndex, choiceIndex) => {
    const newOptions = [...options];
    newOptions[optionIndex].choices.splice(choiceIndex, 1);
    setOptions(newOptions);
  };

  const handleChoiceChange = (optionIndex, choiceIndex, field, value) => {
    const newOptions = [...options];
    newOptions[optionIndex].choices[choiceIndex][field] = value;
    setOptions(newOptions);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Format the ingredients array
      const ingredients = ingredientFields
        .map((field) => field.value)
        .filter((value) => value.trim() !== "");

      // Format the options array - filter out empty options and choices
      const formattedOptions = options
        .filter((option) => option.name.trim() !== "")
        .map((option) => ({
          ...option,
          choices: option.choices
            .filter((choice) => choice.name.trim() !== "")
            .map((choice) => ({
              ...choice,
              price: parseFloat(choice.price) || 0,
            })),
        }));

      // Create FormData for file upload
      const formData = new FormData();

      // Append basic fields
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("price", parseFloat(data.price) || 0);
      formData.append("restaurant", data.restaurant);
      formData.append("category", data.category);
      formData.append("preparationTime", parseInt(data.preparationTime) || 0);
      formData.append("calories", parseInt(data.calories) || 0);
      formData.append("available", data.available);

      // Append arrays and objects as JSON strings
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append("options", JSON.stringify(formattedOptions));

      // Append image if selected
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      const response = await menuService.updateMenuItem(id, formData);

      if (response.success) {
        success("Menu item updated successfully");
        navigate(`/menu/${id}`);
      } else {
        error(response.message || "Failed to update menu item");
      }
    } catch (err) {
      console.error("Error updating menu item:", err);
      error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
        <span className='ml-2 text-gray-600'>Loading menu item data...</span>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Edit Menu Item</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Update the menu item details
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => navigate(`/menu/${id}`)}
          className='flex items-center'
        >
          <FaArrowLeft className='mr-2' /> Back to Details
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Basic Information */}
          <Card title='Basic Information' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* Name */}
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700'
                >
                  Item Name*
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
                    placeholder='Chicken Pasta'
                    {...register("name", {
                      required: "Item name is required",
                    })}
                  />
                </div>
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.name.message}
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
                    placeholder='Describe the menu item'
                    {...register("description")}
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor='price'
                  className='block text-sm font-medium text-gray-700'
                >
                  Price*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaDollarSign className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='number'
                    id='price'
                    step='0.01'
                    min='0'
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.price ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='9.99'
                    {...register("price", {
                      required: "Price is required",
                      min: {
                        value: 0,
                        message: "Price must be greater than or equal to 0",
                      },
                    })}
                  />
                </div>
                {errors.price && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Restaurant */}
              <div>
                <label
                  htmlFor='restaurant'
                  className='block text-sm font-medium text-gray-700'
                >
                  Restaurant*
                </label>
                <select
                  id='restaurant'
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                    errors.restaurant ? "border-red-300" : "border-gray-300"
                  } focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md`}
                  {...register("restaurant", {
                    required: "Restaurant is required",
                  })}
                >
                  <option value=''>Select a restaurant</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                {errors.restaurant && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.restaurant.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor='category'
                  className='block text-sm font-medium text-gray-700'
                >
                  Category*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaTag className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    id='category'
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='Main Course'
                    {...register("category", {
                      required: "Category is required",
                    })}
                  />
                </div>
                {errors.category && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Available */}
              <div className='flex items-start py-2'>
                <div className='flex items-center h-5'>
                  <input
                    id='available'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    {...register("available")}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='available'
                    className='font-medium text-gray-700'
                  >
                    Available for ordering
                  </label>
                  <p className='text-gray-500'>
                    If unchecked, this item will not be shown to customers
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card title='Additional Details' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* Image Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Menu Item Image
                </label>
                <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                  <div className='space-y-1 text-center'>
                    {imagePreview ? (
                      <div className='flex flex-col items-center'>
                        <img
                          src={imagePreview}
                          alt='Preview'
                          className='h-40 object-cover rounded-md'
                        />
                        <button
                          type='button'
                          className='mt-2 text-sm text-red-600 hover:text-red-700'
                          onClick={() => {
                            setImagePreview(null);
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
                            htmlFor='image'
                            className='relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none'
                          >
                            <span>Upload an image</span>
                            <input
                              id='image'
                              type='file'
                              className='sr-only'
                              accept='image/*'
                              {...register("image")}
                              onChange={handleImageChange}
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

              {/* Preparation Time */}
              <div>
                <label
                  htmlFor='preparationTime'
                  className='block text-sm font-medium text-gray-700'
                >
                  Preparation Time (minutes)
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaStopwatch className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='number'
                    id='preparationTime'
                    min='0'
                    className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                    placeholder='15'
                    {...register("preparationTime")}
                  />
                </div>
              </div>

              {/* Calories */}
              <div>
                <label
                  htmlFor='calories'
                  className='block text-sm font-medium text-gray-700'
                >
                  Calories
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaPizzaSlice className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='number'
                    id='calories'
                    min='0'
                    className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                    placeholder='500'
                    {...register("calories")}
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ingredients
                </label>
                <div className='space-y-2'>
                  {ingredientFields.map((field, index) => (
                    <div key={index} className='flex items-center'>
                      <input
                        type='text'
                        className='flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                        placeholder={`Ingredient ${index + 1}`}
                        value={field.value}
                        onChange={(e) =>
                          handleIngredientChange(index, e.target.value)
                        }
                      />
                      <button
                        type='button'
                        className='ml-2 p-2 border border-transparent text-sm font-medium rounded-md text-red-600 hover:text-red-800 focus:outline-none'
                        onClick={() => handleRemoveIngredient(index)}
                        disabled={ingredientFields.length === 1}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  onClick={handleAddIngredient}
                >
                  <FaPlus className='mr-1' /> Add Ingredient
                </Button>
              </div>
            </div>
          </Card>

          {/* Options & Variations */}
          <Card title='Options & Variations' className='lg:col-span-2'>
            <div className='space-y-6'>
              {options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className='border border-gray-200 rounded-md p-4'
                >
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-base font-medium text-gray-900'>
                      Option {optionIndex + 1}
                    </h3>
                    <Button
                      type='button'
                      variant='danger'
                      size='xs'
                      onClick={() => handleRemoveOption(optionIndex)}
                      disabled={options.length === 1}
                    >
                      <FaTimes className='mr-1' /> Remove
                    </Button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Option Name
                      </label>
                      <input
                        type='text'
                        className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                        placeholder='Size, Toppings, etc.'
                        value={option.name}
                        onChange={(e) =>
                          handleOptionChange(
                            optionIndex,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id={`required-${optionIndex}`}
                        className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                        checked={option.required}
                        onChange={(e) =>
                          handleOptionChange(
                            optionIndex,
                            "required",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        htmlFor={`required-${optionIndex}`}
                        className='ml-2 block text-sm text-gray-700'
                      >
                        Required
                      </label>
                    </div>
                  </div>

                  <div className='mb-2'>
                    <h4 className='text-sm font-medium text-gray-700 mb-1'>
                      Choices
                    </h4>
                    <div className='space-y-2'>
                      {option.choices.map((choice, choiceIndex) => (
                        <div
                          key={choiceIndex}
                          className='flex items-center space-x-2'
                        >
                          <input
                            type='text'
                            className='flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                            placeholder='Choice name'
                            value={choice.name}
                            onChange={(e) =>
                              handleChoiceChange(
                                optionIndex,
                                choiceIndex,
                                "name",
                                e.target.value
                              )
                            }
                          />
                          <div className='w-32'>
                            <div className='relative rounded-md shadow-sm'>
                              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaDollarSign className='h-5 w-5 text-gray-400' />
                              </div>
                              <input
                                type='number'
                                step='0.01'
                                min='0'
                                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                                placeholder='0.00'
                                value={choice.price}
                                onChange={(e) =>
                                  handleChoiceChange(
                                    optionIndex,
                                    choiceIndex,
                                    "price",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <button
                            type='button'
                            className='p-2 border border-transparent text-sm font-medium rounded-md text-red-600 hover:text-red-800 focus:outline-none'
                            onClick={() =>
                              handleRemoveChoice(optionIndex, choiceIndex)
                            }
                            disabled={option.choices.length === 1}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='xs'
                      className='mt-2'
                      onClick={() => handleAddChoice(optionIndex)}
                    >
                      <FaPlus className='mr-1' /> Add Choice
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type='button'
                variant='outline'
                onClick={handleAddOption}
                className='mt-2'
              >
                <FaPlus className='mr-1' /> Add Option Group
              </Button>

              <p className='text-sm text-gray-500 mt-2'>
                Options allow customers to customize their order (e.g., Size,
                Toppings, Add-ons). Each option can have multiple choices with
                different prices.
              </p>
            </div>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className='mt-6 flex justify-end space-x-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate(`/menu/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            loading={loading}
            disabled={loading}
          >
            Update Menu Item
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMenuItem;
