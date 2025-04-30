import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import userService from "../../api/users";

const AddUser = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "customer",
      status: "active",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await userService.createUser(data);

      if (response.success) {
        success("User created successfully");
        navigate(`/users/${response.data._id}`);
      } else {
        error(response.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Add User</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Create a new user in the system
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => navigate("/users")}
          className='flex items-center'
        >
          <FaArrowLeft className='mr-2' /> Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <Card title='Basic Information' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* Name */}
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

              {/* Password */}
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700'
                >
                  Password*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaLock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id='password'
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='Password'
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='text-gray-400 hover:text-gray-500 focus:outline-none'
                    >
                      {showPassword ? (
                        <FaEyeSlash className='h-5 w-5' />
                      ) : (
                        <FaEye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.password.message}
                  </p>
                )}
                <p className='mt-1 text-xs text-gray-500'>
                  Password should be at least 8 characters long
                </p>
              </div>
            </div>
          </Card>

          <Card title='User Settings' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* Role */}
              <div>
                <label
                  htmlFor='role'
                  className='block text-sm font-medium text-gray-700'
                >
                  User Role*
                </label>
                <select
                  id='role'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  {...register("role", {
                    required: "Role is required",
                  })}
                >
                  <option value='customer'>Customer</option>
                  <option value='admin'>Admin</option>
                  <option value='restaurant'>Restaurant Manager</option>
                  <option value='rider'>Delivery Rider</option>
                </select>
                {errors.role && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.role.message}
                  </p>
                )}
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
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                  <option value='suspended'>Suspended</option>
                </select>
              </div>

              {/* Send Welcome Email Checkbox */}
              <div className='flex items-start py-2'>
                <div className='flex items-center h-5'>
                  <input
                    id='sendWelcomeEmail'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    {...register("sendWelcomeEmail")}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='sendWelcomeEmail'
                    className='font-medium text-gray-700'
                  >
                    Send welcome email
                  </label>
                  <p className='text-gray-500'>
                    Send an email to the user with their login details
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor='notes'
                  className='block text-sm font-medium text-gray-700'
                >
                  Admin Notes
                </label>
                <div className='mt-1'>
                  <textarea
                    id='notes'
                    rows={3}
                    className='shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md'
                    placeholder='Internal notes about this user'
                    {...register("notes")}
                  />
                </div>
                <p className='mt-1 text-xs text-gray-500'>
                  These notes are only visible to administrators
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className='mt-6 flex justify-end space-x-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate("/users")}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            loading={loading}
            disabled={loading}
          >
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
