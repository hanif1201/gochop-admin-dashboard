import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaDownload,
  FaFilter,
  FaSpinner,
  FaUsers,
  FaUserFriends,
  FaUserClock,
  FaUserPlus,
  FaUserSlash,
  FaMapMarkerAlt,
  FaChartBar,
  FaMale,
  FaFemale,
} from "react-icons/fa";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import useAlert from "../../hooks/useAlert";
import dashboardService from "../../api/dashboard";
import userService from "../../api/users";
import { formatDate, formatNumber } from "../../utils/formatter";
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

const UserReport = () => {
  const { error } = useAlert();

  // State variables
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [users, setUsers] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [reportData, setReportData] = useState({
    summary: {
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
    },
    usersByRole: [],
    usersByStatus: [],
    usersByDate: [],
    usersByGender: [],
    usersByAge: [],
    usersByLocation: [],
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

        // Fetch user statistics
        const statsResponse = await dashboardService.getUserStats(queryParams);
        // Fetch users for table
        const usersResponse = await userService.getUsers();

        if (statsResponse.success && usersResponse.success) {
          const data = statsResponse.data;
          setUsers(usersResponse.data);

          // Sort users by order count to get top users
          const sortedUsers = [...usersResponse.data]
            .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
            .slice(0, 10);
          setTopUsers(sortedUsers);

          // Set report data
          setReportData({
            summary: {
              totalUsers: data.totalUsers || 0,
              newUsers: data.newUsers || 0,
              activeUsers: data.activeUsers || 0,
              inactiveUsers: data.inactiveUsers || 0,
            },
            usersByRole: formatRoleData(data.usersByRole || {}),
            usersByStatus: formatStatusData(data.usersByStatus || {}),
            usersByDate: data.usersByDate || [],
            usersByGender: formatGenderData(data.usersByGender || {}),
            usersByAge: formatAgeData(data.usersByAge || {}),
            usersByLocation: formatLocationData(data.usersByLocation || []),
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

  // Format role data for pie chart
  const formatRoleData = (roleData) => {
    return Object.entries(roleData).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count,
    }));
  };

  // Format status data for pie chart
  const formatStatusData = (statusData) => {
    return Object.entries(statusData).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  // Format gender data for pie chart
  const formatGenderData = (genderData) => {
    return Object.entries(genderData).map(([gender, count]) => ({
      name: gender.charAt(0).toUpperCase() + gender.slice(1),
      value: count,
    }));
  };

  // Format age data for bar chart
  const formatAgeData = (ageData) => {
    const ageGroups = [
      "Under 18",
      "18-24",
      "25-34",
      "35-44",
      "45-54",
      "55-64",
      "65+",
    ];

    return ageGroups.map((group) => ({
      name: group,
      value: ageData[group] || 0,
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

  // Table columns for top users
  const userColumns = [
    {
      header: "User",
      accessor: "name",
      render: (row) => (
        <div className='flex items-center'>
          <div className='h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center'>
            {row.avatar ? (
              <img
                src={row.avatar}
                alt={row.name}
                className='h-8 w-8 rounded-full object-cover'
              />
            ) : (
              <span className='text-gray-500 font-medium'>
                {row.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className='ml-3'>
            <div className='text-sm font-medium text-gray-900'>{row.name}</div>
            <div className='text-xs text-gray-500'>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.role === "admin"
              ? "bg-purple-100 text-purple-800"
              : row.role === "restaurant"
              ? "bg-blue-100 text-blue-800"
              : row.role === "rider"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Joined",
      accessor: "createdAt",
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: "Orders",
      accessor: "orderCount",
      render: (row) => row.orderCount || 0,
    },
    {
      header: "Total Spent",
      accessor: "totalSpent",
      render: (row) => `$${(row.totalSpent || 0).toFixed(2)}`,
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
              {entry.name}: {entry.value}
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
          <h1 className='text-2xl font-bold text-gray-900'>User Report</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Analyze user statistics and metrics
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
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-blue-100 text-blue-600'>
                  <FaUsers className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>Total Users</div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatNumber(reportData.summary.totalUsers)}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-green-100 text-green-600'>
                  <FaUserPlus className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>New Users</div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatNumber(reportData.summary.newUsers)}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-indigo-100 text-indigo-600'>
                  <FaUserFriends className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>Active Users</div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatNumber(reportData.summary.activeUsers)}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className='flex items-center'>
                <div className='p-3 rounded-full bg-red-100 text-red-600'>
                  <FaUserSlash className='h-6 w-6' />
                </div>
                <div className='ml-4'>
                  <div className='text-gray-500 text-sm'>Inactive Users</div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {formatNumber(reportData.summary.inactiveUsers)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* User Growth Chart */}
            <Card title='User Growth' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={reportData.usersByDate}
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
                      dataKey='count'
                      name='New Users'
                      stroke='#8884d8'
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type='monotone'
                      dataKey='total'
                      name='Total Users'
                      stroke='#82ca9d'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* User Role Distribution Chart */}
            <Card title='User Role Distribution' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={reportData.usersByRole}
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
                      {reportData.usersByRole.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} users`, "Count"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* User Status Chart */}
            <Card title='User Status Distribution' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={reportData.usersByStatus}
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
                      {reportData.usersByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name.toLowerCase() === "active"
                              ? "#4CAF50"
                              : entry.name.toLowerCase() === "inactive"
                              ? "#F44336"
                              : COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} users`, "Count"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* User Gender Distribution Chart */}
            <Card title='Gender Distribution' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={reportData.usersByGender}
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
                      {reportData.usersByGender.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name.toLowerCase() === "male"
                              ? "#2196F3"
                              : entry.name.toLowerCase() === "female"
                              ? "#E91E63"
                              : "#9E9E9E"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} users`, "Count"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Charts Row 3 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* User Age Distribution Chart */}
            <Card title='Age Distribution' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={reportData.usersByAge}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey='value'
                      name='Users'
                      fill='#8884d8'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Locations Chart */}
            <Card title='Top User Locations' className='h-full'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={reportData.usersByLocation}
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
                      dataKey='value'
                      name='Users'
                      fill='#8884d8'
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Top Users Table */}
          <Card title='Top Users by Order Count' className='mb-6'>
            <Table
              columns={userColumns}
              data={topUsers}
              loading={loading}
              emptyMessage='No user data available'
            />
          </Card>

          {/* User Insights */}
          <Card title='User Insights' className='mb-6'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaChartBar className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    User Growth Trend
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {reportData.usersByDate.length > 1 &&
                    reportData.usersByDate[0].count <
                      reportData.usersByDate[reportData.usersByDate.length - 1]
                        .count
                      ? `User registrations have shown a positive trend with a ${Math.round(
                          ((reportData.usersByDate[
                            reportData.usersByDate.length - 1
                          ].count -
                            reportData.usersByDate[0].count) /
                            reportData.usersByDate[0].count) *
                            100
                        )}% increase over the selected period.`
                      : "User registrations have remained stable or shown a slight decline over the selected period."}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaUserFriends className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    User Engagement
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {Math.round(
                      (reportData.summary.activeUsers /
                        reportData.summary.totalUsers) *
                        100
                    )}
                    % of your users are currently active, which is{" "}
                    {(reportData.summary.activeUsers /
                      reportData.summary.totalUsers) *
                      100 >
                    60
                      ? "above"
                      : "below"}{" "}
                    the industry average of 60%.
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaUsers className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    User Distribution
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {reportData.usersByRole.length > 0 &&
                      `The largest user group consists of ${
                        reportData.usersByRole.sort(
                          (a, b) => b.value - a.value
                        )[0].name
                      }s, making up ${Math.round(
                        (reportData.usersByRole.sort(
                          (a, b) => b.value - a.value
                        )[0].value /
                          reportData.summary.totalUsers) *
                          100
                      )}% of your total user base.`}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='flex-shrink-0 mt-1'>
                  <FaMapMarkerAlt className='h-5 w-5 text-primary-500' />
                </div>
                <div className='ml-3'>
                  <h3 className='text-base font-medium text-gray-900'>
                    Geographical Distribution
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {reportData.usersByLocation.length > 0 &&
                      `Your users are predominantly from ${
                        reportData.usersByLocation[0].name
                      }, which accounts for ${Math.round(
                        (reportData.usersByLocation[0].value /
                          reportData.summary.totalUsers) *
                          100
                      )}% of your user base.`}
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

export default UserReport;
