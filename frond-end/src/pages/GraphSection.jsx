import React from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function GraphSection({ monthlyData = [], loading = false }) {
  // Use dynamic data if available, otherwise use default
  const hasData = monthlyData && monthlyData.length > 0;

  const labels = hasData
    ? monthlyData.map(item => item.month)
    : ["January", "February", "March", "April", "May", "June"];

  const attendanceDays = hasData
    ? monthlyData.map(item => item.presentDays)
    : [10, 25, 40, 35, 80, 85];

  const attendancePercentages = hasData
    ? monthlyData.map(item => item.percentage)
    : [10, 20, 25, 45, 60, 70];

  // Doughnut chart data (attendance percentage by month)
  const doughnutData = {
    labels: labels.slice(-4), // Show last 4 months
    datasets: [
      {
        label: "Attendance %",
        data: attendancePercentages.slice(-4),
        backgroundColor: ["#0047ab", "#6495ed", "#1e90ff", "#ffdb58"],
        hoverOffset: 10,
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  // Horizontal bar chart data (attendance days)
  const horizontalBarData = {
    labels: labels,
    datasets: [
      {
        label: "Attendance Days",
        data: attendanceDays,
        backgroundColor: "#ff4500",
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const maxAttendance = Math.max(...attendanceDays, 30);

  const horizontalBarOptions = {
    indexAxis: "y",
    scales: {
      x: {
        min: 0,
        max: Math.ceil(maxAttendance / 10) * 10 + 10,
        ticks: { stepSize: 5 }
      },
      y: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    maintainAspectRatio: false,
  };

  // Vertical bar chart data (attendance percentage)
  const verticalBarData = {
    labels: labels,
    datasets: [
      {
        label: "Attendance %",
        data: attendancePercentages,
        backgroundColor: "#1e90ff",
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const verticalBarOptions = {
    scales: {
      y: { min: 0, max: 100, ticks: { stepSize: 20 } },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 transition mb-6 flex flex-col md:flex-row gap-6" style={{ minHeight: "280px" }}>
        <div className="w-full md:w-1/3 h-64 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl p-6 transition mb-6 flex flex-col md:flex-row gap-6"
      style={{ minHeight: "280px" }}
    >
      {/* Doughnut chart (left) */}
      <div className="w-full md:w-1/3 h-64">
        <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Attendance Distribution</h4>
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>

      {/* Bar charts (right side vertical stack) */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        {/* Horizontal bar chart */}
        <div className="h-32">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Present Days by Month</h4>
          <Bar data={horizontalBarData} options={horizontalBarOptions} />
        </div>
        {/* Vertical bar chart */}
        <div className="h-32">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Attendance Percentage</h4>
          <Bar data={verticalBarData} options={verticalBarOptions} />
        </div>
      </div>
    </div>
  );
}

export default GraphSection;
