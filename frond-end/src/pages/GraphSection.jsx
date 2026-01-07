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

function GraphSection() {
  // Doughnut chart data (attendance by month in %)
  const doughnutData = {
    labels: ["January", "February", "March", "April"],
    datasets: [
      {
        label: "Attendance %",
        data: [10, 20, 25, 45],
        backgroundColor: ["#0047ab", "#6495ed", "#1e90ff", "#ffdb58"],
        hoverOffset: 10,
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
    },
    maintainAspectRatio: false,
  };

  // Horizontal bar chart data (attendance days)
  const horizontalBarData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Attendance Days",
        data: [10, 25, 40, 35, 80, 85],
        backgroundColor: "#ff4500",
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const horizontalBarOptions = {
    indexAxis: "y",
    scales: {
      x: { min: 0, max: 90, ticks: { stepSize: 10 } },
      y: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    maintainAspectRatio: false,
  };

  // Vertical bar chart data (attendance days)
  const verticalBarData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Attendance Days",
        data: [10, 25, 40, 35, 80, 85],
        backgroundColor: "#1e90ff",
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const verticalBarOptions = {
    scales: {
      y: { min: 0, max: 90, ticks: { stepSize: 10 } },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <div
      className="bg-white rounded-2xl  p-6  transition mb-6 flex flex-col md:flex-row gap-6"
      style={{ minHeight: "280px" }}
    >
      {/* Doughnut chart (left) */}
      <div className="w-full md:w-1/3 h-64">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>

      {/* Bar charts (right side vertical stack) */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        {/* Horizontal bar chart */}
        <div className="h-32">
          <Bar data={horizontalBarData} options={horizontalBarOptions} />
        </div>
        {/* Vertical bar chart */}
        <div className="h-32">
          <Bar data={verticalBarData} options={verticalBarOptions} />
        </div>
      </div>
    </div>
  );
}

export default GraphSection;
