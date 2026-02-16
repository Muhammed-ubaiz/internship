import React, { useState, useEffect } from "react";
import SideBarStudent from "./SideBarStudent";
import GraphSection from "../GraphSection";
import api from "../../utils/axiosConfig";

function StudentMonthlySummary() {
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    month: "",
    year: ""
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlySummary();
    fetchLeaves();
  }, []);

  const fetchMonthlySummary = async () => {
    try {
      const response = await api.get("/student/monthly-summary");

      if (response.data.success) {
        setSummary(response.data.summary);
        setMonthlyData(response.data.monthlyData);
      }
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await api.get("/student/my-leaves");

      if (response.data.success) {
        setLeaves(response.data.leaves);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] pt-14 lg:pt-0">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 z-40">
        <SideBarStudent />
      </div>

      {/* Main Content */}
      <div className="ml-0 lg:ml-64 p-6 max-w-6xl mx-auto">
        {/* Header - centered on mobile */}
        <div className="mb-6 text-center lg:text-left">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#141E46]">
            Monthly Summary - {summary.month} {summary.year}
          </h2>
        </div>

        {/* Stats / Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-2xl p-5 border animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
              <h3 className="text-lg font-semibold">Total Working Days</h3>
              <p className="text-3xl font-bold text-[#0077b6]">{summary.totalDays}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
              <h3 className="text-lg font-semibold">Present</h3>
              <p className="text-3xl font-bold text-green-600">{summary.presentDays}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
              <h3 className="text-lg font-semibold">Absent / Leaves</h3>
              <p className="text-3xl font-bold text-red-600">{summary.absentDays + summary.leaveDays}</p>
              <p className="text-sm text-gray-500 mt-1">
                (Absent: {summary.absentDays}, Leaves: {summary.leaveDays})
              </p>
            </div>
          </div>
        )}

        {/* Graph Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 mb-6 overflow-x-auto">
          <GraphSection monthlyData={monthlyData} loading={loading} />
        </div>

        {/* Leave Details - Table (desktop) + Cards (mobile) */}
        <div className="bg-white rounded-2xl shadow-2xl p-5">
          <h3 className="text-lg font-semibold mb-4 text-center lg:text-left">Leave Details</h3>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="text-left text-[#0077b6] font-semibold border-b-2 border-gray-200">
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-400">
                      No leave records found
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">{formatDate(leave.from)}</td>
                      <td className="px-4 py-3">{formatDate(leave.to)}</td>
                      <td className="px-4 py-3">{leave.type}</td>
                      <td className="px-4 py-3">{leave.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusStyle(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="block lg:hidden space-y-3">
            {leaves.length === 0 ? (
              <div className="text-center py-6 text-gray-400">No leave records found</div>
            ) : (
              leaves.map((leave) => (
                <div key={leave._id} className="bg-[#EEF6FB] p-4 rounded-xl border border-gray-100">
                  <p className="font-medium text-[#141E46] mb-1">{formatDate(leave.from)} → {formatDate(leave.to)}</p>
                  <p className="text-sm text-gray-600 mb-1">{leave.type}</p>
                  <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap break-words font-medium">Reason:</p>
                  <p className="text-sm text-gray-700 bg-white/60 p-3 rounded-lg whitespace-pre-wrap break-words min-h-[2.5rem]">
                    {leave.reason || "—"}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${getStatusStyle(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default StudentMonthlySummary;
