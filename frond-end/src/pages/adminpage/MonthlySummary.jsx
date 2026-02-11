import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";
import {
  Search,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Filter,
  CalendarDays,
} from "lucide-react";

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

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setSortOrder("asc");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Sidebar />

      <div className="ml-0 md:ml-52 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header - Exact MyStudents Style */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540] font-[Montserrat] mb-2">
                Monthly Attendance Summary
              </h1>
              <p className="text-gray-600">
                {summaryInfo.monthName && (
                  <>{summaryInfo.monthName} {summaryInfo.year} - {summaryInfo.totalWorkingDays} working days</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
          
              <button
                onClick={fetchMonthlySummary}
                disabled={loading}
                className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <strong>Error:</strong> {error}
            </div>
            <button onClick={fetchMonthlySummary} className="mt-2 text-sm underline">
              Try again
            </button>
          </div>
        )}

        {/* Stats Cards - Exact MyStudents Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Present Days</p>
                <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leave Days</p>
                <p className="text-2xl font-bold text-amber-600">{totalLeave}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Absent Days</p>
                <p className="text-2xl font-bold text-red-600">{totalAbsent}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a2540] border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading monthly summary...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMonthlySummary}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredData.length === 0 && students.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[#0a2540]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Data Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              No attendance data available for the selected month.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Filter Bar - Exact MyStudents Style */}
            <div className="hidden lg:block overflow-x-auto max-h-[470px] overflow-y-auto">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center p-5 mt-2 sticky top-0 backdrop-blur-sm py-4 z-10 rounded-xl">
                {/* Search Bar */}
                <div className="group relative w-full sm:w-72">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                    />
                    <button className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#0a2540] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                      <Search className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
                    </button>
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="relative w-full sm:w-48 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
                    >
                      <option value="asc">Sort A-Z</option>
                      <option value="desc">Sort Z-A</option>
                    </select>
                    <Filter className="absolute right-4 w-4 h-4 text-[#0a2540]" />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {(search || sortOrder !== "asc") && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors hover:bg-white rounded-lg flex items-center gap-2"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* TABLE - Exact MyStudents Style */}
              <table className="w-full text-sm border-separate border-spacing-y-3 p-3">
                <thead className="bg-white">
                  <tr className="text-[#1679AB] text-left">
                    <th className="p-3 text-center">#</th>
                    <th className="p-3 text-center">Name</th>
                    <th className="p-3 text-center">Course</th>
                    <th className="p-3 text-center">Batch</th>
                    <th className="p-3 text-center">Total Days</th>
                    <th className="p-3 text-center">Present</th>
                    <th className="p-3 text-center">Leave</th>
                    <th className="p-3 text-center">Absent</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length === 0 ? (
                    <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                      <td colSpan="8" className="text-center p-4 rounded-2xl">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.studentId || index}
                        className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition-all duration-300 hover:scale-[0.99]"
                      >
                        <td className="px-3 py-3 text-center">{index + 1}</td>

                        <td className="px-4 py-3 text-center font-medium break-words">
                          {item.name}
                        </td>

                        <td className="px-4 py-3 text-center break-words">
                          {item.course || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-center break-words">
                          {item.batch}
                        </td>

                        <td className="px-4 py-3 text-center font-medium">
                          {item.totalDays}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {item.presentDays}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {item.leaveDays}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {item.absentDays}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden p-4 space-y-3">
              {filteredData.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                  No students found
                </div>
              ) : (
                filteredData.map((item, idx) => (
                  <div
                    key={item.studentId || idx}
                    className="bg-[#EEF6FB] p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-[#D1E8FF] transition-all duration-300"
                  >
                    <p className="font-semibold text-[#0a2540] mb-1">{item.name}</p>
                    <p className="text-xs text-gray-500 mb-3">{item.course} | {item.batch}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Total Days</p>
                        <p className="font-semibold text-[#0a2540]">{item.totalDays}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg">
                        <p className="text-xs text-green-600">Present</p>
                        <p className="font-semibold text-green-700">{item.presentDays}</p>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-lg">
                        <p className="text-xs text-amber-600">Leave</p>
                        <p className="font-semibold text-amber-700">{item.leaveDays}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded-lg">
                        <p className="text-xs text-red-600">Absent</p>
                        <p className="font-semibold text-red-700">{item.absentDays}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer - Exact MyStudents Style */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-[#0a2540]">
                    {filteredData.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {students.length}
                  </span>{" "}
                  students
                </div>
                
                {(search || sortOrder !== "asc") && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-[#0a2540] hover:underline flex items-center gap-1"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlySummary;