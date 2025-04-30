import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import Button from "../../components/common/Button";
import authService from "../../api/auth";
import useAlert from "../../hooks/useAlert";

const ForgotPassword = () => {
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(data.email);

      if (response.success) {
        setEmailSent(true);
        success(
          "Password reset instructions have been sent to your email address"
        );
      } else {
        error(response.message || "Failed to process your request");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
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
            {emailSent ? "Check your email" : "Forgot your password?"}
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            {emailSent
              ? "We've sent you instructions to reset your password"
              : "Enter your email address to receive a password reset link"}
          </p>
        </div>

        {emailSent ? (
          <div>
            <div className='rounded-md bg-green-50 p-4 mb-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-green-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-green-800'>
                    If an account exists with the email you provided, you'll
                    receive a password reset link shortly.
                  </p>
                </div>
              </div>
            </div>
            <div className='text-center mt-6'>
              <Link
                to='/login'
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email Address
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaEnvelope className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='email'
                  type='email'
                  autoComplete='email'
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder='Email address'
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

            <div>
              <Button
                type='submit'
                variant='primary'
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Send Reset Link
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
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
