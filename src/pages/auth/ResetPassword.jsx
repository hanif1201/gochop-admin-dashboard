import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import Button from "../../components/common/Button";
import authService from "../../api/auth";
import useAlert from "../../hooks/useAlert";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Get password value for validation
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await authService.resetPassword(token, data.password);

      if (response.success) {
        success("Password has been reset successfully");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        error(response.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      error(err.message || "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow'>
        <div className='text-center'>
          <div className='flex justify-center'>
            <div className='h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center'>
              <span className='text-xl font-bold text-white'>GC</span>
            </div>
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Reset your password
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Enter your new password below
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          {/* Password input */}
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              New Password
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaLock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                id='password'
                type={showPassword ? "text" : "password"}
                className={`block w-full pl-10 pr-10 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/,
                    message:
                      "Password must include at least one uppercase letter, one lowercase letter, one number and one special character",
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
          </div>

          {/* Confirm Password input */}
          <div>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-medium text-gray-700'
            >
              Confirm Password
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaLock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                id='confirmPassword'
                type={showConfirmPassword ? "text" : "password"}
                className={`block w-full pl-10 pr-10 py-2 border ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

          <div>
            <Button
              type='submit'
              variant='primary'
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Reset Password
            </Button>
          </div>

          <div className='text-center'>
            <Link
              to='/login'
              className='inline-flex items-center font-medium text-primary-600 hover:text-primary-500'
            >
              <FaArrowLeft className='mr-1 h-4 w-4' />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
