import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";

const Login = () => {
  const { login } = useAuth();
  const { error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = await login(data);

      if (!result.success) {
        error(result.message || "Invalid login credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      error(err.message || "Authentication failed - please try again");
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
            Admin Dashboard
          </h2>
          <p className='mt-2 text-sm text-gray-600'>Sign in to your account</p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit(onSubmit)}>
          <div className='rounded-md shadow-sm -space-y-px'>
            {/* Email input */}
            <div className='mb-4'>
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

            {/* Password input */}
            <div className='mb-4'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaLock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  autoComplete='current-password'
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder='Password'
                  {...register("password", {
                    required: "Password is required",
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
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-sm text-gray-900'
              >
                Remember me
              </label>
            </div>

            <div className='text-sm'>
              <Link
                to='/forgot-password'
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type='submit'
              variant='primary'
              fullWidth
              loading={loading}
              disabled={loading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white'
            >
              Sign in
            </Button>
          </div>
        </form>

        <div className='text-center mt-4'>
          <p className='text-sm text-gray-600'>
            Need support? Contact the administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
