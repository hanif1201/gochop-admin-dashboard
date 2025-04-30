import React, { useState } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Card from "../common/Card";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * OverviewChart component for displaying line charts on dashboard
 */
const OverviewChart = ({
  title,
  data,
  labels,
  datasets,
  loading = false,
  height = 300,
  options = {},
}) => {
  // Time period filter options
  const [period, setPeriod] = useState("weekly");

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    // You would typically fetch new data based on period here
  };

  // Default chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          borderDash: [2],
          drawBorder: false,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 2,
        hitRadius: 10,
        hoverRadius: 4,
      },
    },
  };

  // Merge default options with provided options
  const chartOptions = { ...defaultOptions, ...options };

  // Render chart data or use provided data
  const chartData = data || {
    labels,
    datasets,
  };

  // Define period filter button classes
  const buttonBaseClass = "px-3 py-1 text-sm font-medium rounded-md";
  const activeButtonClass = `${buttonBaseClass} bg-primary-100 text-primary-700`;
  const inactiveButtonClass = `${buttonBaseClass} text-gray-500 hover:bg-gray-100`;

  return (
    <Card
      headerClassName='flex items-center justify-between'
      title={
        <div>
          <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
        </div>
      }
      subtitle={
        <div className='flex space-x-2'>
          <button
            className={
              period === "weekly" ? activeButtonClass : inactiveButtonClass
            }
            onClick={() => handlePeriodChange("weekly")}
          >
            Weekly
          </button>
          <button
            className={
              period === "monthly" ? activeButtonClass : inactiveButtonClass
            }
            onClick={() => handlePeriodChange("monthly")}
          >
            Monthly
          </button>
          <button
            className={
              period === "yearly" ? activeButtonClass : inactiveButtonClass
            }
            onClick={() => handlePeriodChange("yearly")}
          >
            Yearly
          </button>
        </div>
      }
    >
      {loading ? (
        <div className='animate-pulse h-64'>
          <div className='h-full bg-gray-200 rounded'></div>
        </div>
      ) : (
        <div style={{ height }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </Card>
  );
};

OverviewChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object,
  labels: PropTypes.array,
  datasets: PropTypes.array,
  loading: PropTypes.bool,
  height: PropTypes.number,
  options: PropTypes.object,
};

export default OverviewChart;
