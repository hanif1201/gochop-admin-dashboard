import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaCalendarAlt,
  FaChartBar,
  FaFilter,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import useAlert from "../../hooks/useAlert";
import dashboardService from "../../api/dashboard";
import orderService from "../../api/orders";
import restaurantService from "../../api/restaurants";
import { formatDate, formatCurrency } from "../../utils/formatter";
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

const SalesReport = () => {
  const { error } = useAlert();

  // State variables
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [reportData, setReportData] = useState({
    summary: {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      growthRate: 0,
    },
    salesByDay: [],
    salesByRestaurant: [],
    salesByCategory: [],
    topSellingItems: [],
  });

  // Fetch all restaurants for filter
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantService.getRestaurants();
        if (response.success) {
          setRestaurants(response.data);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = { period: dateRange };

        if (selectedRestaurant) {
          queryParams.restaurant = selectedRestaurant;
        }

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

        // Fetch revenue statistics
        const revenueResponse = await dashboardService.getRevenueStats(
          queryParams
        );
        // Fetch order statistics
        const orderResponse = await dashboardService.getOrderStats(queryParams);

        if (revenueResponse.success && orderResponse.success) {
          const { salesByDay, salesByRestaurant, salesByCategory } =
            revenueResponse.data;
          const { topItems } = orderResponse.data;

          // Calculate summary data
          const totalSales = salesByDay.reduce(
            (sum, day) => sum + day.revenue,
            0
          );
          const totalOrders = salesByDay.reduce(
            (sum, day) => sum + day.orderCount,
            0
          );
          const averageOrderValue =
            totalOrders > 0 ? totalSales / totalOrders : 0;

          // Calculate growth rate (simplified)
          const prevPeriodSales = revenueResponse.data.previousPeriodSales || 0;
          const growthRate =
            prevPeriodSales > 0
              ? ((totalSales - prevPeriodSales) / prevPeriodSales) * 100
              : 0;

          setReportData({
            summary: {
              totalSales,
              totalOrders,
              averageOrderValue,
              growthRate,
            },
            salesByDay: salesByDay || [],
            salesByRestaurant: salesByRestaurant || [],
            salesByCategory: salesByCategory || [],
            topSellingItems: topItems || [],
          });
        } else {
          error("Failed to fetch report data");
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        error(err.message || "Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [error, dateRange, customDateRange, selectedRestaurant]);

  // Handle date range change
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  // Handle custom date change
  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle restaurant filter change
  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value);
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    // Implementation for exporting data to CSV
    alert("CSV export functionality would be implemented here");
  };

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
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded shadow-lg'>
          <p className='font-medium text-gray-900'>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.includes("Revenue")
                ? formatCurrency(entry.value)
                : entry.value}
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
          <h1 className='text-2xl font-bold text-gray-900'>Sales Report</h1>
          <p className='mt-1 text-sm text-gray-500'>
            View sales performance and trends
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

      {/* Restaurant Filter */}
      <Card className='mb-6'>
        <div className='flex flex-col md:flex-row md:items-center md:space-x-4'>
          <div className='w-full md:w-1/3'>
            <label
              htmlFor='restaurant'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Restaurant
            </label>
            <select
              id='restaurant'
              name='restaurant'
              className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
              value={selectedRestaurant}
              onChange={handleRestaurantChange}
            >
              <option value=''>All Restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <FaSpinner className='h-8 w-8 text-primary-500 animate-spin' />
          <span className='ml-2 text-gray-600'>Loading report data...</span>
        </div>
      ) : (
        <>
          {/* Sales Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Total Sales</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatCurrency(reportData.summary.totalSales)}
                </div>
                <div className='text-sm text-gray-500 mt-1'>
                  {reportData.summary.growthRate > 0 ? (
                    <span className='text-green-600'>
                      ↑ {reportData.summary.growthRate.toFixed(1)}%
                    </span>
                  ) : (
                    <span className='text-red-600'>
                      ↓ {Math.abs(reportData.summary.growthRate).toFixed(1)}%
                    </span>
                  )}
                  {" from previous period"}
                </div>
              </div>
            </Card>

            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Total Orders</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {reportData.summary.totalOrders}
                </div>
              </div>
            </Card>

            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Average Order Value</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatCurrency(reportData.summary.averageOrderValue)}
                </div>
              </div>
            </Card>

            <Card>
              <div className='text-center'>
                <div className='text-gray-500 mb-1'>Conversion Rate</div>
                <div className='text-3xl font-bold text-gray-900'>
                  {/* Placeholder for conversion rate */}
                  83.5%
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Sales by Day Chart */}
            <Card title='Sales Trend' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={reportData.salesByDay}
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
                    <YAxis yAxisId='left' />
                    <YAxis yAxisId='right' orientation='right' />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      name='Revenue'
                      stroke='#8884d8'
                      yAxisId='left'
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type='monotone'
                      dataKey='orderCount'
                      name='Orders'
                      stroke='#82ca9d'
                      yAxisId='right'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Sales by Restaurant Chart */}
            <Card title='Sales by Restaurant' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={reportData.salesByRestaurant}
                    layout='vertical'
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis
                      dataKey='name'
                      type='category'
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey='revenue'
                      name='Revenue'
                      fill='#8884d8'
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey='orderCount'
                      name='Orders'
                      fill='#82ca9d'
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Sales by Category Chart */}
            <Card title='Sales by Category' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={reportData.salesByCategory}
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
                      {reportData.salesByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Selling Items */}
            <Card title='Top Selling Items' className='h-full'>
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
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {reportData.topSellingItems.length > 0 ? (
                      reportData.topSellingItems.map((item, index) => (
                        <tr key={index}>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <div className='h-10 w-10 flex-shrink-0'>
                                <img
                                  className='h-10 w-10 rounded-md object-cover'
                                  src={
                                    item.image ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt={item.name}
                                />
                              </div>
                              <div className='ml-4'>
                                <div className='text-sm font-medium text-gray-900'>
                                  {item.name}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {item.restaurant?.name ||
                                    "Unknown Restaurant"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500'>
                            {item.orderCount}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900'>
                            {formatCurrency(item.revenue)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan='3'
                          className='px-6 py-4 text-center text-sm text-gray-500'
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Detailed Sales Table */}
          <Card title='Detailed Sales Analysis' className='mb-6'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Date
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
                      Avg. Order Value
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {reportData.salesByDay.length > 0 ? (
                    reportData.salesByDay.map((day, index) => (
                      <tr key={index}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatDate(day.date)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500'>
                          {day.orderCount}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900'>
                          {formatCurrency(day.revenue)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900'>
                          {formatCurrency(
                            day.orderCount > 0
                              ? day.revenue / day.orderCount
                              : 0
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan='4'
                        className='px-6 py-4 text-center text-sm text-gray-500'
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default SalesReport;
