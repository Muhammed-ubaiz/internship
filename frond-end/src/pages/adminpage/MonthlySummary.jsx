import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";

function MonthlySummary() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryInfo, setSummaryInfo] = useState({
    monthName: '',
    year: '',
    totalWorkingDays: 0
  });

  // Fetch monthly summary from backend
  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const [year, monthNum] = month.split('-');
      const res = await api.get("/admin/monthly-summary", {
        params: {
          month: parseInt(monthNum) - 1, // JS months are 0-indexed
          year: parseInt(year)
        }
      });

      if (res.data.success) {
        setStudents(res.data.students || []);
        setSummaryInfo({
          monthName: res.data.month,
          year: res.data.year,
          totalWorkingDays: res.data.totalWorkingDays
        });
      }
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
      setError(err.response?.data?.message || "Failed to fetch monthly summary");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when month changes
  useEffect(() => {
    fetchMonthlySummary();
  }, [month]);

  // Filter and sort data
  const filteredData = students
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  // Calculate totals
  const totalPresent = students.reduce((sum, s) => sum + s.presentDays, 0);
  const totalLeave = students.reduce((sum, s) => sum + s.leaveDays, 0);
  const totalAbsent = students.reduce((sum, s) => sum + s.absentDays, 0);

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-2 sm:p-4 lg:p-6 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-0 lg:ml-52 w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#0a2540] font-[Montserrat] text-center lg:text-left mb-2">
            Monthly Attendance Summary
          </h2>
          {summaryInfo.monthName && (
            <p className="text-sm text-gray-600 text-center lg:text-left">
              {summaryInfo.monthName} {summaryInfo.year} - {summaryInfo.totalWorkingDays} working days
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-[#0a2540]">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Present Days</p>
            <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Leave Days</p>
            <p className="text-2xl font-bold text-yellow-600">{totalLeave}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Absent Days</p>
            <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="asc">Sort A-Z</option>
            <option value="desc">Sort Z-A</option>
          </select>

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

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3 mb-6">
              {filteredData.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                  No students found
                </div>
              ) : (
                filteredData.map((item, idx) => (
                  <div
                    key={item.studentId || idx}
                    className="bg-[#f1f8fd] p-4 rounded-xl shadow transform transition-all duration-300"
                  >
                    <p className="font-semibold text-[#0a2540]">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.course} | {item.batch}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <p>Total Days: <span className="font-semibold">{item.totalDays}</span></p>
                      <p className="text-green-600">Present: <span className="font-semibold">{item.presentDays}</span></p>
                      <p className="text-yellow-600">Leave: <span className="font-semibold">{item.leaveDays}</span></p>
                      <p className="text-red-600">Absent: <span className="font-semibold">{item.absentDays}</span></p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-4 overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4 min-w-[700px]">
                <thead>
                  <tr className="text-left text-[#0077b6] font-semibold">
                    <th className="px-4">Name</th>
                    <th className="px-4">Course</th>
                    <th className="px-4">Batch</th>
                    <th className="px-4">Total Days</th>
                    <th className="px-4">Present</th>
                    <th className="px-4">Leave</th>
                    <th className="px-4">Absent</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr
                        key={item.studentId || idx}
                        className="bg-[#f1f8fd] transform transition-all duration-300 hover:scale-98"
                      >
                        <td className="px-4 py-3 rounded-l-lg font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-purple-600">{item.course || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-600">{item.batch}</td>
                        <td className="px-4 py-3">{item.totalDays}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">{item.presentDays}</td>
                        <td className="px-4 py-3 text-yellow-600 font-semibold">{item.leaveDays}</td>
                        <td className="px-4 py-3 rounded-r-lg text-red-600 font-semibold">{item.absentDays}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Stats */}
            {students.length > 0 && (
              <div className="mt-6 text-sm text-gray-500 text-right">
                Showing {filteredData.length} of {students.length} students
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MonthlySummary;
