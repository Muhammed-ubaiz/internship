import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";
import { Search, Filter, Users, GraduationCap, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");

  // Get unique batches and courses
  const batches = ["All", ...new Set(students.map((s) => s.batch).filter(Boolean))];
  const courses = ["All", ...new Set(students.map((s) => s.course).filter(Boolean))];

  // --------------------- FETCH STUDENTS ---------------------
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      const res = await api.get("/mentor/getStudents", {
        headers: {
          Role: role,
        },
      });

      setStudents(res.data || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setError(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  // --------------------- FILTERED STUDENTS ---------------------
  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      student.name?.toLowerCase().includes(search) ||
      student.email?.toLowerCase().includes(search) ||
      student.batch?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || student.status === statusFilter;

    const matchesBatch =
      batchFilter === "All" || student.batch === batchFilter;

    const matchesCourse =
      courseFilter === "All" || student.course === courseFilter;

    return matchesSearch && matchesStatus && matchesBatch && matchesCourse;
  });

  // --------------------- STATS ---------------------
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === "Active").length,
    inactive: students.filter(s => s.status === "Inactive").length,
    batches: batches.length - 1,
    courses: courses.length - 1
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setBatchFilter("All");
    setCourseFilter("All");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-4 h-4" />;
      case "Inactive":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#0a2540]">
              My Students
            </h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#0a2540]">
              My Students
            </h2>
          </div>

          {/* Mobile Subtitle */}
          <div className="lg:hidden mb-3 text-center bg-white/50 p-2 rounded-lg">
            <p className="text-sm text-gray-600">
              Manage and track all your assigned students
            </p>
          </div>

          {/* Refresh Button - Desktop */}
          <div className="hidden lg:flex justify-end mb-6">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Refresh Button - Mobile */}
          <div className="lg:hidden flex justify-center mb-6">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <strong>Error:</strong> {error}
              </div>
              <button onClick={handleRefresh} className="mt-2 text-sm underline">
                Try again
              </button>
            </div>
          )}

          {/* STATS CARDS */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 border hover:scale-105 transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700">Total Students</h3>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0a2540]">{stats.total}</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 border hover:scale-105 transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700">Active</h3>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 border hover:scale-105 transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700">Batches</h3>
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{stats.batches}</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 border hover:scale-105 transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700">Courses</h3>
                  <Filter className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-600">{stats.courses}</p>
              </div>
            </div>
          )}

          {/* MAIN CONTENT */}
          {loading && students.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a2540] border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading students data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-red-700 mb-2">
                Error Loading Data
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border p-8 sm:p-12 text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-[#0a2540]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {students.length === 0
                  ? "No Students Found"
                  : "No Matching Students"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {students.length === 0
                  ? "No students have been assigned to you yet."
                  : "No students match your current filters. Try adjusting your search criteria."}
              </p>
              {(searchTerm || statusFilter !== "All" || batchFilter !== "All" || courseFilter !== "All") && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
              {/* Search & Filter */}
              <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:gap-4 items-stretch lg:items-center px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sticky top-0 backdrop-blur-sm z-10 bg-white border-b border-gray-100">
                <div className="group relative w-full lg:w-72">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <input
                      type="text"
                      placeholder="Search by name, email or batch..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none rounded-full"
                    />
                    <button type="button" className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#0a2540] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                      <Search className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
                    </button>
                  </div>
                </div>

                <div className="relative w-full lg:w-48 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <Filter className="absolute right-4 w-4 h-4 text-[#0a2540] pointer-events-none" />
                  </div>
                </div>

                <div className="relative w-full lg:w-48 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
                    >
                      {courses.map((course, index) => (
                        <option key={index} value={course}>
                          {course === "All" ? "All Courses" : course}
                        </option>
                      ))}
                    </select>
                    <GraduationCap className="absolute right-4 w-4 h-4 text-[#0a2540] pointer-events-none" />
                  </div>
                </div>

                <div className="relative w-full lg:w-48 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
                    >
                      {batches.map((batch, index) => (
                        <option key={index} value={batch}>
                          {batch === "All" ? "All Batches" : batch}
                        </option>
                      ))}
                    </select>
                    <Users className="absolute right-4 w-4 h-4 text-[#0a2540] pointer-events-none" />
                  </div>
                </div>

                {(searchTerm || statusFilter !== "All" || batchFilter !== "All" || courseFilter !== "All") && (
                  <button
                    onClick={clearAllFilters}
                    className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors hover:bg-gray-50 rounded-lg"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block px-4 sm:px-6 lg:px-8 pb-4">
                <div className="overflow-x-auto">
                  <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="w-full text-sm border-separate border-spacing-y-3">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="text-[#1679AB] text-left">
                          <th className="p-3 text-center">#</th>
                          <th className="p-3 text-center">Name</th>
                          <th className="p-3 text-center">Email</th>
                          <th className="p-3 text-center">Course</th>
                          <th className="p-3 text-center">Batch</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                            <td colSpan="6" className="text-center p-4 rounded-2xl">
                              No students found
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student, index) => (
                            <tr
                              key={student._id}
                              className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transform transition-all duration-300 hover:scale-98"
                            >
                              <td className="px-3 py-3 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                                    <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-center font-medium break-words">
                                {student.name}
                              </td>

                              <td className="px-4 py-3 text-center break-words">
                                {student.email}
                              </td>

                              <td className="px-4 py-3 text-center break-words">
                                {student.course || "N/A"}
                              </td>

                              <td className="px-4 py-3 text-center break-words">
                                {student.batch || "N/A"}
                              </td>

                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                                >
                                  {student.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="block lg:hidden px-4 sm:px-6 lg:px-8 pb-4">
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2 space-y-3">
                  {filteredStudents.length === 0 ? (
                    <div className="bg-[#EEF6FB] rounded-xl p-6 text-center text-gray-500">
                      No students found
                    </div>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <div
                        key={student._id}
                        className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transform transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                                  <span className="text-sm font-bold">{idx + 1}</span>
                                </div>
                                <span className="font-semibold text-[#0a2540]">{student.name}</span>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                student.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {student.status}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mb-2 break-all">{student.email}</p>
                            <p className="text-xs text-gray-500">{student.course || "N/A"} | {student.batch || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                  <div className="text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-[#0a2540]">
                      {filteredStudents.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {students.length}
                    </span>{" "}
                    students
                  </div>

                  {(searchTerm || statusFilter !== "All" || batchFilter !== "All" || courseFilter !== "All") && (
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
    </div>
  );
}

export default MyStudents;
