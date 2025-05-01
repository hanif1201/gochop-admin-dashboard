import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaSave,
  FaShieldAlt,
  FaHistory,
  FaDesktop,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAuth from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";
import authService from "../../api/auth";
import { formatDate } from "../../utils/formatter";

const Security = () => {
  const { user } = useAuth();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch for password to use in confirm password validation
  const newPassword = watch("newPassword");

  // Sample login history data (would typically come from the API)
  const loginHistory = [
    {
      id: 1,
      date: new Date(Date.now() - 1000 * 60 * 5),
      device: "Chrome on Windows",
      ip: "192.168.1.1",
      location: "New York, USA",
      status: "success",
    },
    {
      id: 2,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      device: "Safari on iPhone",
      ip: "192.168.1.2",
      location: "Los Angeles, USA",
      status: "success",
    },
    {
      id: 3,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      device: "Firefox on Mac",
      ip: "192.168.1.3",
      location: "Chicago, USA",
      status: "success",
    },
    {
      id: 4,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      device: "Chrome on Android",
      ip: "192.168.1.4",
      location: "Miami, USA",
      status: "failed",
    },
  ];

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await authService.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        success("Password updated successfully");
        reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        error(response.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Security Settings</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Manage your password and account security
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {/* Change Password */}
        <Card title='Change Password'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-6'>
              {/* Current Password */}
              <div>
                <label
                  htmlFor='currentPassword'
                  className='block text-sm font-medium text-gray-700'
                >
                  Current Password*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaLock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id='currentPassword'
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.currentPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='Enter current password'
                    {...register("currentPassword", {
                      required: "Current password is required",
                    })}
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className='text-gray-400 hover:text-gray-500 focus:outline-none'
                    >
                      {showCurrentPassword ? (
                        <FaEyeSlash className='h-5 w-5' />
                      ) : (
                        <FaEye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>
                {errors.currentPassword && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor='newPassword'
                  className='block text-sm font-medium text-gray-700'
                >
                  New Password*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaKey className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id='newPassword'
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.newPassword ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='Enter new password'
                    {...register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      pattern: {
                        value:
                          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/,
                        message:
                          "Password must include at least one uppercase letter, one lowercase letter, one number and one special character",
                      },
                    })}
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className='text-gray-400 hover:text-gray-500 focus:outline-none'
                    >
                      {showNewPassword ? (
                        <FaEyeSlash className='h-5 w-5' />
                      ) : (
                        <FaEye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>
                {errors.newPassword ? (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.newPassword.message}
                  </p>
                ) : (
                  <p className='mt-1 text-xs text-gray-500'>
                    Password must be at least 8 characters long and include
                    uppercase, lowercase, numbers, and special characters.
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-700'
                >
                  Confirm Password*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaKey className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id='confirmPassword'
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='Confirm new password'
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    })}
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className='text-gray-400 hover:text-gray-500 focus:outline-none'
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className='h-5 w-5' />
                      ) : (
                        <FaEye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  variant='primary'
                  loading={loading}
                  disabled={loading}
                >
                  <FaSave className='mr-2' /> Update Password
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Two-Factor Authentication */}
        <Card title='Two-Factor Authentication'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <FaShieldAlt className='h-5 w-5 text-gray-400' />
            </div>
            <div className='ml-3 flex-1'>
              <div className='flex justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Two-Factor Authentication
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Add an extra layer of security to your account by requiring
                    both your password and a verification code from your mobile
                    phone.
                  </p>
                </div>
                <div className='ml-4'>
                  <div className='relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in'>
                    <input
                      type='checkbox'
                      name='toggle-2fa'
                      id='toggle-2fa'
                      className='focus:outline-none focus:ring-2 focus:ring-primary-500 absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer'
                      style={{ transform: "translateX(0)" }}
                    />
                    <label
                      htmlFor='toggle-2fa'
                      className='block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer'
                    ></label>
                  </div>
                </div>
              </div>
              <div className='mt-4'>
                <Button variant='outline' size='sm'>
                  Set Up Two-Factor Authentication
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Login History */}
        <Card title='Login History'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Date & Time
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Device & Browser
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    IP Address
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Location
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loginHistory.map((login) => (
                  <tr key={login.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {formatDate(login.date)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center'>
                      <FaDesktop className='mr-2 text-gray-400' />
                      {login.device}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {login.ip}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {login.location}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          login.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {login.status === "success" ? "Successful" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-4 flex justify-end'>
            <Button variant='outline' size='sm'>
              <FaHistory className='mr-2' /> View Full History
            </Button>
          </div>
        </Card>

        {/* Active Sessions */}
        <Card title='Active Sessions'>
          <div className='space-y-4'>
            <div className='flex items-start border-l-4 border-green-500 bg-green-50 p-4 rounded-md'>
              <div className='flex-shrink-0'>
                <FaDesktop className='h-5 w-5 text-green-500' />
              </div>
              <div className='ml-3 flex-1'>
                <div className='flex justify-between'>
                  <div>
                    <h3 className='text-sm font-medium text-green-800'>
                      Current Session
                    </h3>
                    <p className='text-sm text-green-700'>
                      Chrome on Windows • {user?.ip || "192.168.1.1"} •{" "}
                      {user?.location || "New York, USA"}
                    </p>
                    <p className='text-xs text-green-600 mt-1'>
                      Last activity: Just now
                    </p>
                  </div>
                  <div className='ml-4'>
                    <span className='px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-start border-l-4 border-gray-300 p-4 rounded-md'>
              <div className='flex-shrink-0'>
                <FaDesktop className='h-5 w-5 text-gray-400' />
              </div>
              <div className='ml-3 flex-1'>
                <div className='flex justify-between'>
                  <div>
                    <h3 className='text-sm font-medium text-gray-900'>
                      Safari on iPhone
                    </h3>
                    <p className='text-sm text-gray-500'>
                      192.168.1.2 • Los Angeles, USA
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                      Last activity: 2 hours ago
                    </p>
                  </div>
                  <div className='ml-4'>
                    <Button variant='danger' size='xs'>
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 border-t border-gray-200 pt-6'>
            <Button variant='danger'>Logout of All Devices</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Security;
