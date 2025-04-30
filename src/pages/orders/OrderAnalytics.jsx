import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaSpinner,
  FaDownload,
} from "react-icons/fa";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import orderService from "../../api/orders";
import dashboardService from "../../api/dashboard";
import { formatCurrency, formatNumber } from "../../utils/formatter";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const OrderAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error } = useAlert();

  // State variables
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Analytics data states
  const [stats, setStats] = useState({
    total: 0,
    totalToday: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    cancelRate: 0,
  });
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [ordersByDay, setOrdersByDay] = useState([]);
  const [ordersByHour, setOrdersByHour] = useState([]);
  const [ordersByRestaurant, setOrdersByRestaurant] = useState([]);
  const [topItems, setTopItems] = useState([]);

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#8DD1E1",
    "#A4DE6C",
    "#D0ED57",
  ];

  const STATUS_COLORS = {
    pending: "#FFBB28",
    accepted: "#0088FE",
    preparing: "#8884D8",
    ready_for_pickup: "#82CA9D",
    assigned_to_rider: "#FF8042",
    picked_up: "#A4DE6C",
    on_the_way: "#8DD1E1",
    delivered: "#00C49F",
    cancelled: "#FF5252",
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = { period: dateRange };

        if (dateRange === "custom" && customDateRange.startDate) {
          queryParams.startDate = new Date(
            customDateRange.startDate
          ).toISOString();
          if (customDateRange.endDate) {
            const endDate = new Date(customDateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            queryParams.endDate = endDate.toISOString();
          }
        }

        // Use the appropriate API method based on user role
        const statsResponse = await dashboardService.getOrderStats(queryParams);

        if (statsResponse.success) {
          const data = statsResponse.data;

          // Set overall stats
          setStats({
            total: data.total || 0,
            totalToday: data.totalToday || 0,
            totalRevenue: data.totalRevenue || 0,
            averageOrderValue: data.averageOrderValue || 0,
            cancelRate: data.cancelRate || 0,
          });

          // Set orders by status
          if (data.byStatus) {
            setOrdersByStatus(
              Object.entries(data.byStatus).map(([status, count]) => ({
                name: formatStatus(status),
                value: count,
                status,
              }))
            );
          }

          // Set orders by day
          if (data.byDay) {
            setOrdersByDay(data.byDay);
          }

          // Set orders by hour
          if (data.byHour) {
            setOrdersByHour(
              Object.entries(data.byHour).map(([hour, count]) => ({
                hour: parseInt(hour),
                count,
                formattedHour: formatHour(parseInt(hour)),
              }))
            );
          }

          // Set orders by restaurant
          if (data.byRestaurant) {
            setOrdersByRestaurant(data.byRestaurant.slice(0, 5));
          }

          // Set top items
          if (data.topItems) {
            setTopItems(data.topItems.slice(0, 10));
          }
        } else {
          error("Failed to fetch analytics data");
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        error(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [error, dateRange, customDateRange]);

  // Format status string
  const formatStatus = (status) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Format hour for display
  const formatHour = (hour) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  // Handle date range change
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  // Handle custom date range change
  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    // Implementation for exporting analytics to CSV
    alert("CSV export functionality would be implemented here");
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded shadow-lg'>
          <p className='font-medium text-gray-900'>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === "Revenue" ? " USD" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='flex items-center'>
            <Button
              variant='text'
              size='sm'
              className='mr-2'
              onClick={() => navigate("/orders")}
            >
              <FaArrowLeft className='mr-1' /> Back
            </Button>
            <h1 className='text-2xl font-bold text-gray-900'>
              Order Analytics
            </h1>
          </div>
          <p className='mt-1 text-sm text-gray-500'>
            View detailed analytics about your orders
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex flex-wrap gap-2'>
          <div className='relative'>
            <select
              className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
              value={dateRange}
              onChange={handleDateRangeChange}
            >
              <option value='today'>Today</option>
              <option value='week'>Last 7 Days</option>
              <option value='month'>Last 30 Days</option>
              <option value='year'>Last 12 Months</option>
              <option value='custom'>Custom Range</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <div className='flex space-x-2'>
              <div className='relative'>
                <input
                  type='date'
                  name='startDate'
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={customDateRange.startDate}
                  onChange={handleCustomDateChange}
                />
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaCalendarAlt className='h-5 w-5 text-gray-400' />
                </div>
              </div>
              <div className='relative'>
                <input
                  type='date'
                  name='endDate'
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                  value={customDateRange.endDate}
                  min={customDateRange.startDate}
                  onChange={handleCustomDateChange}
                />
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaCalendarAlt className='h-5 w-5 text-gray-400' />
                </div>
              </div>
            </div>
          )}

          <Button variant='outline' onClick={handleExportCSV}>
            <FaDownload className='mr-2' /> Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
          <span className='ml-2 text-gray-600'>Loading analytics data...</span>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Total Orders</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatNumber(stats.total)}
                </div>
                <div className='text-sm text-gray-500 mt-1'>
                  {stats.totalToday} today
                </div>
              </div>
            </Card>

            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Total Revenue</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
            </Card>

            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Average Order Value</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatCurrency(stats.averageOrderValue)}
                </div>
              </div>
            </Card>

            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Cancellation Rate</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.cancelRate.toFixed(1)}%
                </div>
              </div>
            </Card>

            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Completion Rate</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {(100 - stats.cancelRate).toFixed(1)}%
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Orders by Day Chart */}
            <Card title='Orders by Day' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={ordersByDay}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='orderCount'
                      name='Orders'
                      stroke='#8884d8'
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      name='Revenue'
                      stroke='#82ca9d'
                      yAxisId='right'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Orders by Status Pie Chart */}
            <Card title='Orders by Status' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                      nameKey='name'
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.status] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} orders`, "Count"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Orders by Hour Chart */}
            <Card title='Orders by Hour' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={ordersByHour}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='formattedHour' />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey='count'
                      name='Orders'
                      fill='#8884d8'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Restaurants Chart */}
            <Card title='Top Restaurants' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={ordersByRestaurant}
                    layout='vertical'
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis
                      type='category'
                      dataKey='name'
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey='orderCount'
                      name='Orders'
                      fill='#8884d8'
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey='revenue'
                      name='Revenue'
                      fill='#82ca9d'
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Top Items Table */}
          <Card title='Top Menu Items' className='mb-6'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Item
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Restaurant
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Orders
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Revenue
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Avg. Price
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {topItems.map((item, index) => (
                    <tr key={index}>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='h-10 w-10 flex-shrink-0'>
                            <img
                              className='h-10 w-10 rounded-full object-cover'
                              src={
                                item.image || "https://via.placeholder.com/40"
                              }
                              alt={item.name}
                            />
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {item.name}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {item.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {item.restaurant?.name || "Unknown"}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500'>
                        {item.orderCount}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900'>
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900'>
                        {formatCurrency(item.averagePrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Analytics Insights */}
          <Card title='Insights' className='mb-6'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaChartLine className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Peak Hours
                  </h3>
                  <p className='text-sm text-gray-500'>
                    The most active ordering times are between{" "}
                    {ordersByHour.length > 0
                      ? `${formatHour(
                          ordersByHour.reduce(
                            (max, item) =>
                              item.count > ordersByHour[max].count
                                ? ordersByHour.indexOf(item)
                                : max,
                            0
                          )
                        )} and ${formatHour(
                          (ordersByHour.reduce(
                            (max, item) =>
                              item.count > ordersByHour[max].count
                                ? ordersByHour.indexOf(item)
                                : max,
                            0
                          ) +
                            1) %
                            24
                        )}`
                      : "N/A"}
                    . Consider optimizing staffing during these hours.
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaChartPie className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Top Performing Restaurant
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {ordersByRestaurant.length > 0
                      ? `${
                          ordersByRestaurant[0].name
                        } is your top performing restaurant with ${
                          ordersByRestaurant[0].orderCount
                        } orders and ${formatCurrency(
                          ordersByRestaurant[0].revenue
                        )} in revenue.`
                      : "No restaurant data available."}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaChartBar className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Most Popular Item
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {topItems.length > 0
                      ? `${topItems[0].name} is the most ordered item with ${
                          topItems[0].orderCount
                        } orders, generating ${formatCurrency(
                          topItems[0].revenue
                        )} in revenue.`
                      : "No item data available."}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaChartBar className='h-5 w-5 text-yellow-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Cancellation Analysis
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {stats.cancelRate > 10
                      ? `Your cancellation rate of ${stats.cancelRate.toFixed(
                          1
                        )}% is higher than the industry average of 8%. Consider reviewing your order processing times and restaurant fulfillment capabilities.`
                      : `Your cancellation rate of ${stats.cancelRate.toFixed(
                          1
                        )}% is below the industry average of 8%. Great job!`}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default OrderAnalytics;
