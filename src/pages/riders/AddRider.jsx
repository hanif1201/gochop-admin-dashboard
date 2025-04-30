import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMotorcycle,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaUpload,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import riderService from "../../api/riders";

const AddRider = () => {
  const navigate = useNavigate();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [licensePreview, setLicensePreview] = useState(null);
  const [insurancePreview, setInsurancePreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

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
      password: "",
      licenseNumber: "",
      vehicleType: "motorcycle",
      vehicleModel: "",
      vehiclePlate: "",
      status: "active",
      isAvailable: true,
      maxDeliveryDistance: 10,
      documents: {
        license: null,
        insurance: null,
        photo: null,
      },
    },
  });

  // Watch for file inputs
  const licenseFile = watch("documents.license");
  const insuranceFile = watch("documents.insurance");
  const photoFile = watch("documents.photo");

  // Handle license image change
  const handleLicenseChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle insurance image change
  const handleInsuranceChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInsurancePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile photo change
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Create FormData for file uploads
      const formData = new FormData();

      // Append non-file fields to formData
      Object.keys(data).forEach((key) => {
        if (key !== "documents") {
          if (typeof data[key] === "object") {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Create rider first
      const response = await riderService.createRider(formData);

      if (response.success) {
        const riderId = response.data._id;

        // Upload documents if they exist
        const uploadPromises = [];

        if (data.documents.license && data.documents.license[0]) {
          const licenseFormData = new FormData();
          licenseFormData.append("document", data.documents.license[0]);
          licenseFormData.append("type", "license");
          uploadPromises.push(
            riderService.uploadDocument(
              riderId,
              "license",
              data.documents.license[0]
            )
          );
        }

        if (data.documents.insurance && data.documents.insurance[0]) {
          const insuranceFormData = new FormData();
          insuranceFormData.append("document", data.documents.insurance[0]);
          insuranceFormData.append("type", "insurance");
          uploadPromises.push(
            riderService.uploadDocument(
              riderId,
              "insurance",
              data.documents.insurance[0]
            )
          );
        }

        if (data.documents.photo && data.documents.photo[0]) {
          const photoFormData = new FormData();
          photoFormData.append("document", data.documents.photo[0]);
          photoFormData.append("type", "photo");
          uploadPromises.push(
            riderService.uploadDocument(
              riderId,
              "photo",
              data.documents.photo[0]
            )
          );
        }

        // Wait for all uploads to complete
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
        }

        success("Rider created successfully");
        navigate(`/riders/${riderId}`);
      } else {
        error(response.message || "Failed to create rider");
      }
    } catch (err) {
      console.error("Error creating rider:", err);
      error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Add Rider</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Create a new delivery rider in the system
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => navigate("/riders")}
          className='flex items-center'
        >
          <FaArrowLeft className='mr-2' /> Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <Card title='Basic Information' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* Profile Photo Upload */}
              <div className='flex justify-center'>
                <div className='relative'>
                  <div
                    className={`h-24 w-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 ${
                      photoPreview
                        ? ""
                        : "border-2 border-dashed border-gray-300"
                    }`}
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt='Profile preview'
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <FaUser className='h-12 w-12 text-gray-400' />
                    )}
                  </div>
                  <label
                    htmlFor='photo'
                    className='absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer'
                  >
                    <FaUpload className='h-4 w-4 text-gray-600' />
                    <input
                      type='file'
                      id='photo'
                      className='sr-only'
                      accept='image/*'
                      {...register("documents.photo")}
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
              </div>

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
                    placeholder='rider@example.com'
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

          <Card title='Vehicle Information' className='lg:col-span-1'>
            <div className='space-y-4'>
              {/* License Number */}
              <div>
                <label
                  htmlFor='licenseNumber'
                  className='block text-sm font-medium text-gray-700'
                >
                  Driver's License Number*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaIdCard className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    id='licenseNumber'
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.licenseNumber
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='DL12345678'
                    {...register("licenseNumber", {
                      required: "License number is required",
                    })}
                  />
                </div>
                {errors.licenseNumber && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.licenseNumber.message}
                  </p>
                )}
              </div>

              {/* Vehicle Type */}
              <div>
                <label
                  htmlFor='vehicleType'
                  className='block text-sm font-medium text-gray-700'
                >
                  Vehicle Type*
                </label>
                <select
                  id='vehicleType'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  {...register("vehicleType", {
                    required: "Vehicle type is required",
                  })}
                >
                  <option value='motorcycle'>Motorcycle</option>
                  <option value='scooter'>Scooter</option>
                  <option value='bicycle'>Bicycle</option>
                  <option value='car'>Car</option>
                </select>
                {errors.vehicleType && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.vehicleType.message}
                  </p>
                )}
              </div>

              {/* Vehicle Model */}
              <div>
                <label
                  htmlFor='vehicleModel'
                  className='block text-sm font-medium text-gray-700'
                >
                  Vehicle Model*
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaMotorcycle className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    id='vehicleModel'
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.vehicleModel ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder='Honda CBR 150R'
                    {...register("vehicleModel", {
                      required: "Vehicle model is required",
                    })}
                  />
                </div>
                {errors.vehicleModel && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.vehicleModel.message}
                  </p>
                )}
              </div>

              {/* Vehicle Plate */}
              <div>
                <label
                  htmlFor='vehiclePlate'
                  className='block text-sm font-medium text-gray-700'
                >
                  License Plate Number*
                </label>
                <input
                  type='text'
                  id='vehiclePlate'
                  className={`mt-1 block w-full border ${
                    errors.vehiclePlate ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder='ABC 1234'
                  {...register("vehiclePlate", {
                    required: "License plate number is required",
                  })}
                />
                {errors.vehiclePlate && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.vehiclePlate.message}
                  </p>
                )}
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
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  min='1'
                  step='0.5'
                  {...register("maxDeliveryDistance", {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>
          </Card>

          <Card title='Documents' className='lg:col-span-2'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* License Document */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Driver's License Image*
                </label>
                <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                  <div className='space-y-1 text-center'>
                    {licensePreview ? (
                      <div className='flex flex-col items-center'>
                        <img
                          src={licensePreview}
                          alt='License preview'
                          className='h-32 object-cover rounded-md'
                        />
                        <button
                          type='button'
                          className='mt-2 text-sm text-red-600 hover:text-red-700'
                          onClick={() => {
                            setLicensePreview(null);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaIdCard className='mx-auto h-12 w-12 text-gray-400' />
                        <div className='flex text-sm text-gray-600'>
                          <label
                            htmlFor='license'
                            className='relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none'
                          >
                            <span>Upload license</span>
                            <input
                              id='license'
                              type='file'
                              className='sr-only'
                              accept='image/*'
                              {...register("documents.license", {
                                required: "License image is required",
                              })}
                              onChange={handleLicenseChange}
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
                {errors.documents?.license && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.documents.license.message}
                  </p>
                )}
              </div>

              {/* Insurance Document */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Vehicle Insurance
                </label>
                <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                  <div className='space-y-1 text-center'>
                    {insurancePreview ? (
                      <div className='flex flex-col items-center'>
                        <img
                          src={insurancePreview}
                          alt='Insurance preview'
                          className='h-32 object-cover rounded-md'
                        />
                        <button
                          type='button'
                          className='mt-2 text-sm text-red-600 hover:text-red-700'
                          onClick={() => {
                            setInsurancePreview(null);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaUpload className='mx-auto h-12 w-12 text-gray-400' />
                        <div className='flex text-sm text-gray-600'>
                          <label
                            htmlFor='insurance'
                            className='relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none'
                          >
                            <span>Upload insurance</span>
                            <input
                              id='insurance'
                              type='file'
                              className='sr-only'
                              accept='image/*'
                              {...register("documents.insurance")}
                              onChange={handleInsuranceChange}
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
            </div>

            <div className='mt-6'>
              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='isAvailable'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    {...register("isAvailable")}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='isAvailable'
                    className='font-medium text-gray-700'
                  >
                    Available for delivery
                  </label>
                  <p className='text-gray-500'>
                    Mark the rider as available for accepting deliveries right
                    away
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className='mt-6 flex justify-end space-x-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate("/riders")}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            loading={loading}
            disabled={loading}
          >
            Create Rider
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRider;
