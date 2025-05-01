// File location: src/pages/settings/AppSettings.jsx
// Used in route: <Route path='/settings/app' element={<AppSettings />} />

import React, { useState } from "react";
import {
  FaSave,
  FaMoon,
  FaSun,
  FaGlobe,
  FaBell,
  FaDatabase,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useTheme from "../../hooks/useTheme";

const AppSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useAlert();
  const [loading, setLoading] = useState(false);

  // App settings state
  const [settings, setSettings] = useState({
    // System settings
    siteName: "GoChop Admin",
    logoUrl: "/logo.png",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    defaultLanguage: "en",

    // Order settings
    orderPrefixID: "ORD",
    autoAssignRiders: true,
    maxOrderItems: 20,
    minOrderAmount: 5,
    autoAcceptOrders: false,
    orderCancellationTime: 5, // minutes

    // Payment settings
    currency: "USD",
    taxRate: 8.5, // percentage
    deliveryFee: 2.99,
    serviceFee: 1.99,
    allowCashOnDelivery: true,
    allowCreditCards: true,
    allowPayPal: true,

    // Notification settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,

    // Map settings
    mapProvider: "google",
    googleMapsApiKey: "YOUR_API_KEY",
    defaultLocation: {
      lat: 40.7128,
      lng: -74.006,
    },
    defaultZoom: 10,
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value)
          : value,
    }));
  };

  // Handle nested object changes (for map settings)
  const handleNestedChange = (parent, field, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [parent]: {
        ...prevSettings[parent],
        [field]: value,
      },
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setLoading(true);

      // Here you would typically call an API to save the settings
      // For demonstration, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      success("Application settings updated successfully");
    } catch (err) {
      console.error("Error saving settings:", err);
      error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Application Settings
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Manage system-wide settings and configurations
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {/* System Settings */}
        <Card title='System Settings'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Site Name
                </label>
                <input
                  type='text'
                  name='siteName'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.siteName}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Logo URL
                </label>
                <input
                  type='text'
                  name='logoUrl'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.logoUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Timezone
                </label>
                <select
                  name='timezone'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  value={settings.timezone}
                  onChange={handleInputChange}
                >
                  <option value='America/New_York'>Eastern Time (ET)</option>
                  <option value='America/Chicago'>Central Time (CT)</option>
                  <option value='America/Denver'>Mountain Time (MT)</option>
                  <option value='America/Los_Angeles'>Pacific Time (PT)</option>
                  <option value='UTC'>UTC</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Date Format
                </label>
                <select
                  name='dateFormat'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  value={settings.dateFormat}
                  onChange={handleInputChange}
                >
                  <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
                  <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
                  <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Time Format
                </label>
                <select
                  name='timeFormat'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  value={settings.timeFormat}
                  onChange={handleInputChange}
                >
                  <option value='12h'>12-hour (AM/PM)</option>
                  <option value='24h'>24-hour</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Default Language
                </label>
                <select
                  name='defaultLanguage'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  value={settings.defaultLanguage}
                  onChange={handleInputChange}
                >
                  <option value='en'>English</option>
                  <option value='es'>Spanish</option>
                  <option value='fr'>French</option>
                  <option value='de'>German</option>
                  <option value='zh'>Chinese</option>
                </select>
              </div>

              <div className='flex items-center mt-8'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={toggleTheme}
                  className='flex items-center'
                >
                  {theme === "dark" ? (
                    <>
                      <FaSun className='mr-2' /> Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <FaMoon className='mr-2' /> Switch to Dark Mode
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Settings */}
        <Card title='Order Settings'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Order ID Prefix
                </label>
                <input
                  type='text'
                  name='orderPrefixID'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.orderPrefixID}
                  onChange={handleInputChange}
                />
                <p className='mt-1 text-xs text-gray-500'>
                  This prefix will be added to all order IDs (e.g., ORD-12345)
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Maximum Order Items
                </label>
                <input
                  type='number'
                  name='maxOrderItems'
                  min='1'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.maxOrderItems}
                  onChange={handleInputChange}
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Maximum number of items a customer can add to their cart
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Minimum Order Amount ($)
                </label>
                <input
                  type='number'
                  name='minOrderAmount'
                  min='0'
                  step='0.01'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.minOrderAmount}
                  onChange={handleInputChange}
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Minimum amount required to place an order
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Order Cancellation Time (minutes)
                </label>
                <input
                  type='number'
                  name='orderCancellationTime'
                  min='1'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.orderCancellationTime}
                  onChange={handleInputChange}
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Time window (in minutes) during which customers can cancel
                  their order
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='autoAssignRiders'
                    name='autoAssignRiders'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    checked={settings.autoAssignRiders}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='autoAssignRiders'
                    className='font-medium text-gray-700'
                  >
                    Auto-assign Riders
                  </label>
                  <p className='text-gray-500'>
                    Automatically assign available riders to new orders
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='autoAcceptOrders'
                    name='autoAcceptOrders'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    checked={settings.autoAcceptOrders}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='autoAcceptOrders'
                    className='font-medium text-gray-700'
                  >
                    Auto-accept Orders
                  </label>
                  <p className='text-gray-500'>
                    Automatically accept new orders without restaurant
                    confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card title='Payment Settings'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Currency
                </label>
                <select
                  name='currency'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  value={settings.currency}
                  onChange={handleInputChange}
                >
                  <option value='USD'>USD ($)</option>
                  <option value='EUR'>EUR (€)</option>
                  <option value='GBP'>GBP (£)</option>
                  <option value='CAD'>CAD (C$)</option>
                  <option value='AUD'>AUD (A$)</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Tax Rate (%)
                </label>
                <input
                  type='number'
                  name='taxRate'
                  min='0'
                  step='0.01'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.taxRate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Default Delivery Fee
                </label>
                <input
                  type='number'
                  name='deliveryFee'
                  min='0'
                  step='0.01'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.deliveryFee}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='allowCashOnDelivery'
                    name='allowCashOnDelivery'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    checked={settings.allowCashOnDelivery}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='allowCashOnDelivery'
                    className='font-medium text-gray-700'
                  >
                    Cash on Delivery
                  </label>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='allowCreditCards'
                    name='allowCreditCards'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    checked={settings.allowCreditCards}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='allowCreditCards'
                    className='font-medium text-gray-700'
                  >
                    Credit Cards
                  </label>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='allowPayPal'
                    name='allowPayPal'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    checked={settings.allowPayPal}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='allowPayPal'
                    className='font-medium text-gray-700'
                  >
                    PayPal
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Service Fee
              </label>
              <input
                type='number'
                name='serviceFee'
                min='0'
                step='0.01'
                className='mt-1 block w-full md:w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                value={settings.serviceFee}
                onChange={handleInputChange}
              />
              <p className='mt-1 text-xs text-gray-500'>
                Additional service fee charged on each order
              </p>
            </div>
          </div>
        </Card>

        {/* Map Settings */}
        <Card title='Map Settings'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Map Provider
                </label>
                <select
                  name='mapProvider'
                  className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                  value={settings.mapProvider}
                  onChange={handleInputChange}
                >
                  <option value='google'>Google Maps</option>
                  <option value='mapbox'>Mapbox</option>
                  <option value='osm'>OpenStreetMap</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  API Key
                </label>
                <input
                  type='text'
                  name='googleMapsApiKey'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.googleMapsApiKey}
                  onChange={handleInputChange}
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Required API key for the selected map provider
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Default Latitude
                </label>
                <input
                  type='number'
                  step='0.000001'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.defaultLocation.lat}
                  onChange={(e) =>
                    handleNestedChange(
                      "defaultLocation",
                      "lat",
                      parseFloat(e.target.value)
                    )
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Default Longitude
                </label>
                <input
                  type='number'
                  step='0.000001'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.defaultLocation.lng}
                  onChange={(e) =>
                    handleNestedChange(
                      "defaultLocation",
                      "lng",
                      parseFloat(e.target.value)
                    )
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Default Zoom Level
                </label>
                <input
                  type='number'
                  name='defaultZoom'
                  min='1'
                  max='20'
                  className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={settings.defaultZoom}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card title='Notification Settings'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='emailNotifications'
                    name='emailNotifications'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    checked={settings.emailNotifications}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='emailNotifications'
                    className='font-medium text-gray-700'
                  >
                    Email Notifications
                  </label>
                  <p className='text-gray-500'>
                    Send email notifications for important updates
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='smsNotifications'
                    name='smsNotifications'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    checked={settings.smsNotifications}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='smsNotifications'
                    className='font-medium text-gray-700'
                  >
                    SMS Notifications
                  </label>
                  <p className='text-gray-500'>
                    Send SMS notifications for critical updates
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex items-center h-5'>
                  <input
                    id='pushNotifications'
                    name='pushNotifications'
                    type='checkbox'
                    className='focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded'
                    checked={settings.pushNotifications}
                    onChange={handleInputChange}
                  />
                </div>
                <div className='ml-3 text-sm'>
                  <label
                    htmlFor='pushNotifications'
                    className='font-medium text-gray-700'
                  >
                    Push Notifications
                  </label>
                  <p className='text-gray-500'>
                    Send push notifications to mobile devices
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className='flex justify-end'>
          <Button
            variant='primary'
            onClick={handleSaveSettings}
            loading={loading}
            disabled={loading}
          >
            <FaSave className='mr-2' /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
