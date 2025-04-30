import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const NotFound = () => {
  return (
    <div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8'>
      <div className='text-center'>
        <h1 className='mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl'>
          404
        </h1>
        <p className='mt-2 text-base font-semibold text-primary-600'>
          Page not found
        </p>
        <p className='mt-4 text-base text-gray-500'>
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className='mt-6'>
          <Link to='/dashboard'>
            <Button variant='primary'>Go back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
