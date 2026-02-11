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
  const [dailyRecords, setDailyRecords] = useState([]); // New state for daily records
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlySummary();
  }, []);

  const fetchMonthlySummary = async () => {
    try {
      const response = await api.get("/student/monthly-summary");

      if (response.data.success) {
        setSummary(response.data.summary);
        setMonthlyData(response.data.monthlyData);
        setDailyRecords(response.data.dailyRecords || []); // Set daily records
      }
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-[#EEF6FB]">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideBarStudent />
      </div>

      {/* Main Content */}
      <div className="ml-0 lg:ml-64 p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#141E46] text-center lg:text-left w-full">
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

        {/* Daily Attendance Table */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-[#141E46]">Daily Attendance Report</h3>
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="text-left text-[#0077b6] font-semibold border-b-2 border-gray-200 bg-blue-50">
                <th className="px-4 py-3 rounded-tl-lg">Date</th>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Punch In</th>
                <th className="px-4 py-3">Punch Out</th>
                <th className="px-4 py-3">Working Time</th>
                <th className="px-4 py-3 rounded-tr-lg">Break Time</th>
              </tr>
            </thead>
            <tbody>
              {dailyRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No records found for this month
                  </td>
                </tr>
              ) : (
                dailyRecords.map((record, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-700">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-gray-600">{record.day}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                            record.status === 'Weekend' ? 'bg-gray-100 text-gray-600' :
                              record.status.includes('Leave') ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-600'
                        }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{record.punchIn}</td>
                    <td className="px-4 py-3 text-gray-600">{record.punchOut}</td>
                    <td className="px-4 py-3 font-medium text-[#141E46]">{record.totalWorking}</td>
                    <td className="px-4 py-3 text-gray-500">{record.totalBreak}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default StudentMonthlySummary;
