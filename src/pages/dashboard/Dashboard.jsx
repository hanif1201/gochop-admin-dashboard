import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUtensils,
  FaShoppingBag,
  FaMoneyBillWave,
  FaMotorcycle,
} from "react-icons/fa";
import StatCard from "../../components/dashboard/StatCard";
import OverviewChart from "../../components/dashboard/OverviewChart";
import RecentOrders from "../../components/dashboard/RecentOrders";
import Card from "../../components/common/Card";
import useAuth from "../../hooks/useAuth";
import useAlert from "../../hooks/useAlert";
import dashboardService from "../../api/dashboard";
import orderService from "../../api/orders";
import { formatCurrency } from "../../utils/formatter";

const Dashboard = () => {
  const { user } = useAuth();
  const { error } = useAlert();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, customers: 0, restaurants: 0, riders: 0 },
    restaurants: { total: 0 },
    orders: { total: 0, pending: 0, processing: 0, completed: 0 },
    riders: { total: 0, active: 0 },
    revenue: { total: 0 },
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard statistics
        const statsResponse = await dashboardService.getDashboardStats();

        if (statsResponse.success) {
          setStats(statsResponse.data);

          // Process revenue data for chart
          if (statsResponse.data.revenue && statsResponse.data.revenue.byDay) {
            const revenueData = statsResponse.data.revenue.byDay;

            // Prepare chart data
            setSalesData({
              labels: revenueData.map((item) => item.date),
              datasets: [
                {
                  label: "Revenue",
                  data: revenueData.map((item) => item.revenue),
                  borderColor: "#0ea5e9",
                  backgroundColor: "rgba(14, 165, 233, 0.1)",
                  fill: true,
                  tension: 0.4,
                },
                {
                  label: "Orders",
                  data: revenueData.map((item) => item.orderCount),
                  borderColor: "#8b5cf6",
                  backgroundColor: "rgba(139, 92, 246, 0.0)",
                  borderDash: [5, 5],
                  fill: false,
                  tension: 0.4,
                  yAxisID: "y1",
                },
              ],
            });
          }
        }

        // Fetch recent orders
        const ordersResponse = await orderService.getOrders({ limit: 5 });

        if (ordersResponse.success) {
          setRecentOrders(ordersResponse.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [error]);

  // Custom chart options
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Revenue ($)",
        },
      },
      y1: {
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Order Count",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Welcome back, {user?.name || "Admin"}! Here's what's happening with
          your platform today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6'>
        <StatCard
          title='Total Users'
          value={stats.users.total}
          icon={<FaUsers className='h-6 w-6' />}
          loading={loading}
        />

        <StatCard
          title='Restaurants'
          value={stats.restaurants.total}
          icon={<FaUtensils className='h-6 w-6' />}
          loading={loading}
        />

        <StatCard
          title='Total Orders'
          value={stats.orders.total}
          icon={<FaShoppingBag className='h-6 w-6' />}
          loading={loading}
        />

        <StatCard
          title='Active Riders'
          value={stats.riders.active}
          icon={<FaMotorcycle className='h-6 w-6' />}
          loading={loading}
        />

        <StatCard
          title='Total Revenue'
          value={formatCurrency(stats.revenue.total)}
          icon={<FaMoneyBillWave className='h-6 w-6' />}
          loading={loading}
        />
      </div>

      {/* Charts & Recent Orders */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        {/* Revenue Chart */}
        <OverviewChart
          title='Revenue & Orders Overview'
          data={salesData}
          loading={loading}
          options={chartOptions}
        />

        {/* Top Restaurants */}
        <Card title='Top Restaurants'>
          {loading ? (
            <div className='animate-pulse space-y-4'>
              {[...Array(5)].map((_, index) => (
                <div key={index} className='flex items-center py-2'>
                  <div className='flex-shrink-0 h-8 w-8 rounded-full bg-gray-200'></div>
                  <div className='ml-4 flex-1'>
                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  </div>
                  <div className='h-5 bg-gray-200 rounded w-12'></div>
                </div>
              ))}
            </div>
          ) : stats.restaurants.top && stats.restaurants.top.length > 0 ? (
            <div className='divide-y divide-gray-200'>
              {stats.restaurants.top.map((restaurant, index) => (
                <div key={index} className='flex items-center py-3'>
                  <div className='flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium'>
                    {index + 1}
                  </div>
                  <div className='ml-4 flex-1'>
                    <h4 className='text-sm font-medium text-gray-900'>
                      {restaurant.name}
                    </h4>
                    <div className='flex items-center'>
                      <div className='flex'>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(restaurant.averageRating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                        ))}
                      </div>
                      <span className='text-xs text-gray-500 ml-1'>
                        ({restaurant.ratingCount} reviews)
                      </span>
                    </div>
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {restaurant.orderCount || 0} orders
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='py-4 text-center text-gray-500'>
              No restaurant data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent Orders */}
      <RecentOrders orders={recentOrders} loading={loading} />
    </div>
  );
};

export default Dashboard;
