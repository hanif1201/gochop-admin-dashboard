import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaDownload,
  FaFilter,
  FaSpinner,
  FaUtensils,
  FaStore,
  FaMoneyBillWave,
  FaShoppingBag,
  FaStar,
  FaChartBar,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import useAlert from "../../hooks/useAlert";
import dashboardService from "../../api/dashboard";
import restaurantService from "../../api/restaurants";
import {
  formatDate,
  formatCurrency,
  formatNumber,
} from "../../utils/formatter";
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

const RestaurantReport = () => {
  const { error } = useAlert();

  // State variables
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [restaurants, setRestaurants] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [reportData, setReportData] = useState({
    summary: {
      totalRestaurants: 0,
      activeRestaurants: 0,
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
    },
    salesByRestaurant: [],
    restaurantsByCuisine: [],
    salesByDay: [],
    topRestaurantsByRating: [],
    restaurantsByLocation: [],
  });

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

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
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

        // Fetch restaurant statistics
        const statsResponse = await dashboardService.getRestaurantStats(
          queryParams
        );
        // Fetch restaurants for table
        const restaurantsResponse = await restaurantService.getRestaurants();

        if (statsResponse.success && restaurantsResponse.success) {
          const data = statsResponse.data;
          setRestaurants(restaurantsResponse.data);

          // Sort restaurants by order count to get top restaurants
          const sortedRestaurants = [...restaurantsResponse.data]
            .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
            .slice(0, 10);
          setTopRestaurants(sortedRestaurants);

          // Set report data
          setReportData({
            summary: {
              totalRestaurants: data.totalRestaurants || 0,
              activeRestaurants: data.activeRestaurants || 0,
              totalOrders: data.totalOrders || 0,
              totalRevenue: data.totalRevenue || 0,
              averageOrderValue: data.averageOrderValue || 0,
            },
            salesByRestaurant: data.salesByRestaurant || [],
            restaurantsByCuisine: formatCuisineData(
              data.restaurantsByCuisine || {}
            ),
            salesByDay: data.salesByDay || [],
            topRestaurantsByRating: data.topRestaurantsByRating || [],
            restaurantsByLocation: formatLocationData(
              data.restaurantsByLocation || []
            ),
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
  }, [error, dateRange, customDateRange]);

  // Format cuisine data for pie chart
  const formatCuisineData = (cuisineData) => {
    return Object.entries(cuisineData).map(([cuisine, count]) => ({
      name: cuisine,
      value: count,
    }));
  };

  // Format location data for bar chart
  const formatLocationData = (locationData) => {
    return locationData
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        name: item.location,
        value: item.count,
      }));
  };

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

  // Handle export to CSV
  const handleExportCSV = () => {
    // Implementation for exporting data to CSV
    alert("CSV export functionality would be implemented here");
  };

  // Table columns for top restaurants
  const restaurantColumns = [
    {
      header: "Restaurant",
      accessor: "name",
      render: (row) => (
        <div className='flex items-center'>
          <div className='h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
            {row.logo ? (
              <img
                src={row.logo}
                alt={row.name}
                className='h-8 w-8 rounded-full object-cover'
              />
            ) : (
              <FaUtensils className='h-4 w-4 text-gray-400' />
            )}
          </div>
          <div className='ml-3'>
            <div className='text-sm font-medium text-gray-900'>{row.name}</div>
            <div className='text-xs text-gray-500'>
              {row.cuisineType && row.cuisineType.join(", ")}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === "open"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Orders",
      accessor: "orderCount",
      render: (row) => row.orderCount || 0,
    },
    {
      header: "Revenue",
      accessor: "revenue",
      render: (row) => formatCurrency(row.revenue || 0),
    },
    {
      header: "Rating",
      accessor: "averageRating",
      render: (row) => (
        <div className='flex items-center'>
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(row.averageRating || 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className='ml-1 text-gray-500 text-xs'>
            {row.averageRating ? row.averageRating.toFixed(1) : "N/A"}
            {row.ratingCount ? ` (${row.ratingCount})` : ""}
          </span>
        </div>
      ),
    },
    {
      header: "Joined",
      accessor: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
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
          <h1 className='text-2xl font-bold text-gray-900'>
            Restaurant Report
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Analyze restaurant performance and metrics
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
          <span className='ml-2 text-gray-600'>Loading report data...</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-blue-100 text-blue-600'>
                  <FaStore className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>Total Restaurants</div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatNumber(reportData.summary.totalRestaurants)}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-green-100 text-green-600'>
                  <FaUtensils className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>
                    Active Restaurants
                  </div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatNumber(reportData.summary.activeRestaurants)}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-indigo-100 text-indigo-600'>
                  <FaShoppingBag className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>Total Orders</div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatNumber(reportData.summary.totalOrders)}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-yellow-100 text-yellow-600'>
                  <FaMoneyBillWave className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>Total Revenue</div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatCurrency(reportData.summary.totalRevenue)}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-purple-100 text-purple-600'>
                  <FaMoneyBillWave className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>Avg. Order Value</div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatCurrency(reportData.summary.averageOrderValue)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Sales Trend Chart */}
            <Card title='Revenue Trend' className='h-full'>
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

            {/* Cuisine Distribution Chart */}
            <Card title='Restaurant Cuisine Distribution' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={reportData.restaurantsByCuisine}
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
                      {reportData.restaurantsByCuisine.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} restaurants`, "Count"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Top Restaurants by Revenue */}
            <Card title='Top Restaurants by Revenue' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={reportData.salesByRestaurant.slice(0, 10)}
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
                      dataKey='revenue'
                      name='Revenue'
                      fill='#8884d8'
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Restaurants by Rating */}
            <Card title='Top Restaurants by Rating' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={reportData.topRestaurantsByRating.slice(0, 10)}
                    layout='vertical'
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      type='number'
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                    />
                    <YAxis
                      type='category'
                      dataKey='name'
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey='rating'
                      name='Rating'
                      fill='#FFB800'
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Top Restaurants Table */}
          <Card title='Top Performing Restaurants' className='mb-6'>
            <Table
              columns={restaurantColumns}
              data={topRestaurants}
              loading={loading}
              emptyMessage='No restaurant data available'
            />
          </Card>

          {/* Restaurant Insights */}
          <Card title='Restaurant Insights' className='mb-6'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaChartBar className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Revenue Analysis
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {reportData.salesByRestaurant.length > 0 &&
                      `Your top performing restaurant "${
                        reportData.salesByRestaurant[0].name
                      }" accounts for ${Math.round(
                        (reportData.salesByRestaurant[0].revenue /
                          reportData.summary.totalRevenue) *
                          100
                      )}% of total revenue. ${
                        Math.round(
                          (reportData.salesByRestaurant[0].revenue /
                            reportData.summary.totalRevenue) *
                            100
                        ) > 30
                          ? "Consider diversifying your restaurant portfolio to reduce dependency on a single venue."
                          : "You have a well-balanced distribution of revenue across restaurants."
                      }`}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaUtensils className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Cuisine Popularity
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {reportData.restaurantsByCuisine.length > 0 &&
                      `${
                        reportData.restaurantsByCuisine.sort(
                          (a, b) => b.value - a.value
                        )[0].name
                      } is the most popular cuisine type, representing ${Math.round(
                        (reportData.restaurantsByCuisine.sort(
                          (a, b) => b.value - a.value
                        )[0].value /
                          reportData.summary.totalRestaurants) *
                          100
                      )}% of your restaurant portfolio.`}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaStar className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Rating Insights
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {reportData.topRestaurantsByRating.length > 0 &&
                      `The average rating across all restaurants is ${(
                        reportData.topRestaurantsByRating.reduce(
                          (sum, r) => sum + r.rating,
                          0
                        ) / reportData.topRestaurantsByRating.length
                      ).toFixed(
                        1
                      )}. Restaurants with ratings above 4.5 tend to generate ${Math.round(
                        reportData.topRestaurantsByRating
                          .filter((r) => r.rating >= 4.5)
                          .reduce((sum, r) => sum + (r.revenue || 0), 0) /
                          reportData.topRestaurantsByRating
                            .filter((r) => r.rating < 4.5)
                            .reduce((sum, r) => sum + (r.revenue || 0), 0)
                      )}x more revenue than lower-rated ones.`}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaMapMarkerAlt className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Location Analysis
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {reportData.restaurantsByLocation.length > 0 &&
                      `${
                        reportData.restaurantsByLocation[0].name
                      } has the highest concentration of restaurants (${
                        reportData.restaurantsByLocation[0].value
                      } restaurants), representing ${Math.round(
                        (reportData.restaurantsByLocation[0].value /
                          reportData.summary.totalRestaurants) *
                          100
                      )}% of your total restaurants. ${
                        reportData.restaurantsByLocation.length > 5
                          ? `Consider expanding to underserved areas like ${
                              reportData.restaurantsByLocation[
                                reportData.restaurantsByLocation.length - 1
                              ].name
                            }.`
                          : ""
                      }`}
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

export default RestaurantReport;
