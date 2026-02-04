import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";

function MonthlySummary1() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryInfo, setSummaryInfo] = useState({
    month: "",
    year: "",
    course: "",
    totalWorkingDays: 0
  });

  useEffect(() => {
    fetchMonthlySummary();
  }, [month]);

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const [year, monthNum] = month.split("-");
      const response = await api.get("/mentor/monthly-summary", {
        params: {
          month: parseInt(monthNum) - 1, // JavaScript months are 0-indexed
          year: parseInt(year)
        }
      });

      if (response.data.success) {
        setData(response.data.students || []);
        setSummaryInfo({
          month: response.data.month,
          year: response.data.year,
          course: response.data.course,
          totalWorkingDays: response.data.totalWorkingDays
        });
      }
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
      setError(err.response?.data?.message || err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  // Calculate totals
  const totalPresent = data.reduce((sum, item) => sum + item.presentDays, 0);
  const totalLeaves = data.reduce((sum, item) => sum + item.leaveDays, 0);
  const totalAbsent = data.reduce((sum, item) => sum + item.absentDays, 0);

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="ml-0 lg:ml-52 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat]">
            Monthly Attendance Summary
          </h2>
          {summaryInfo.course && (
            <p className="text-gray-600 mt-1">
              Course: {summaryInfo.course} | {summaryInfo.month} {summaryInfo.year}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-[#0a2540]">{data.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Working Days</p>
            <p className="text-2xl font-bold text-blue-600">{summaryInfo.totalWorkingDays}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Present</p>
            <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Leaves</p>
            <p className="text-2xl font-bold text-yellow-600">{totalLeaves}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Month Filter */}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="asc">Sort A-Z</option>
            <option value="desc">Sort Z-A</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchMonthlySummary}
            disabled={loading}
            className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <strong>Error:</strong> {error}
            <button onClick={fetchMonthlySummary} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No students found</p>
              <p className="text-sm mt-2">
                {data.length === 0
                  ? "No attendance data available for this month."
                  : "No students match your search criteria."}
              </p>
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-y-3 min-w-[600px]">
              <thead>
                <tr className="text-left text-[#0077b6] font-semibold">
                  <th className="px-4">Name</th>
                  <th className="px-4">Batch</th>
                  <th className="px-4">Total Days</th>
                  <th className="px-4">Present</th>
                  <th className="px-4">Leave</th>
                  <th className="px-4">Absent</th>
                  <th className="px-4">Attendance %</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, index) => {
                  const attendancePercent = item.totalDays > 0
                    ? Math.round((item.presentDays / item.totalDays) * 100)
                    : 0;

                  return (
                    <tr
                      key={item.studentId || index}
                      className="bg-[#f1f8fd] transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                    >
                      <td className="px-4 py-3 rounded-l-lg font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {item.batch || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.totalDays}</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">
                        {item.presentDays}
                      </td>
                      <td className="px-4 py-3 text-yellow-600 font-semibold">
                        {item.leaveDays}
                      </td>
                      <td className="px-4 py-3 text-red-600 font-semibold">
                        {item.absentDays}
                      </td>
                      <td className="px-4 py-3 rounded-r-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                attendancePercent >= 75
                                  ? "bg-green-500"
                                  : attendancePercent >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${attendancePercent}%` }}
                            ></div>
                          </div>
                          <span
                            className={`font-semibold ${
                              attendancePercent >= 75
                                ? "text-green-600"
                                : attendancePercent >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {attendancePercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Stats */}
        {!loading && filteredData.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-right">
            Showing {filteredData.length} of {data.length} students
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlySummary1;
