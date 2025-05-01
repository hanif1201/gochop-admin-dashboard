import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaSpinner,
  FaSave,
  FaCamera,
  FaUserCircle,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAuth from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";
import authService from "../../api/auth";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  // Watch for avatar file changes
  const avatarFile = watch("avatar");

  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user, reset]);

  // Handle avatar image change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Create a FormData instance for file uploads
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone || "");

      // Append avatar if selected
      if (data.avatar && data.avatar[0]) {
        formData.append("avatar", data.avatar[0]);
      }

      const response = await authService.updateUserDetails(formData);

      if (response.success) {
        // Update the user data in the auth context
        updateProfile(response.data);
        success("Profile updated successfully");
      } else {
        error(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className='flex justify-center items-center h-64'>
        <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
        <span className='ml-2 text-gray-600'>Loading profile data...</span>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Profile Settings</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Update your personal information and profile picture
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {/* Left Column - Avatar */}
        <div className='md:col-span-1'>
          <Card>
            <div className='flex flex-col items-center py-4'>
              <div className='relative'>
                <div className='h-32 w-32 rounded-full overflow-hidden bg-gray-100 mb-4'>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt='Profile preview'
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <FaUserCircle className='h-full w-full text-gray-300' />
                  )}
                </div>
                <label
                  htmlFor='avatar'
                  className='absolute bottom-4 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer'
                >
                  <FaCamera className='h-4 w-4 text-gray-600' />
                  <input
                    type='file'
                    id='avatar'
                    accept='image/*'
                    className='sr-only'
                    {...register("avatar")}
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              <h3 className='text-lg font-medium text-gray-900'>{user.name}</h3>
              <p className='text-sm text-gray-500'>{user.email}</p>
              <div className='mt-2'>
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
          </Card>

          <Card className='mt-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Account Info
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Account created</span>
                <span className='text-gray-900'>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Last updated</span>
                <span className='text-gray-900'>
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Last login</span>
                <span className='text-gray-900'>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Status</span>
                <span
                  className={`${
                    user.status === "active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Profile Form */}
        <div className='md:col-span-2'>
          <Card title='Personal Information'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='space-y-6'>
                {/* Full Name */}
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Full Name*
                  </label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <FaUser className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      type='text'
                      id='name'
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                      placeholder='John Doe'
                      {...register("name", {
                        required: "Name is required",
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
                      placeholder='john@example.com'
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
                    Phone Number
                  </label>
                  <div className='mt-1 relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <FaPhone className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      type='tel'
                      id='phone'
                      className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                      placeholder='(123) 456-7890'
                      {...register("phone")}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className='flex justify-end'>
                  <Button
                    type='submit'
                    variant='primary'
                    loading={loading}
                    disabled={loading}
                  >
                    <FaSave className='mr-2' /> Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          <Card title='Notification Preferences' className='mt-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='text-sm font-medium text-gray-900'>
                    Email Notifications
                  </h4>
                  <p className='text-sm text-gray-500'>
                    Receive email notifications for important updates
                  </p>
                </div>
                <div className='flex items-center h-5'>
                  <input
                    id='email_notifications'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    defaultChecked={true}
                  />
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='text-sm font-medium text-gray-900'>
                    Order Updates
                  </h4>
                  <p className='text-sm text-gray-500'>
                    Receive notifications for order status changes
                  </p>
                </div>
                <div className='flex items-center h-5'>
                  <input
                    id='order_updates'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    defaultChecked={true}
                  />
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='text-sm font-medium text-gray-900'>
                    System Announcements
                  </h4>
                  <p className='text-sm text-gray-500'>
                    Receive notifications about system updates and maintenance
                  </p>
                </div>
                <div className='flex items-center h-5'>
                  <input
                    id='system_announcements'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    defaultChecked={true}
                  />
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='text-sm font-medium text-gray-900'>
                    Marketing Communications
                  </h4>
                  <p className='text-sm text-gray-500'>
                    Receive promotional emails and special offers
                  </p>
                </div>
                <div className='flex items-center h-5'>
                  <input
                    id='marketing_communications'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    defaultChecked={false}
                  />
                </div>
              </div>
            </div>

            <div className='mt-6 flex justify-end'>
              <Button type='button' variant='outline'>
                Save Preferences
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
