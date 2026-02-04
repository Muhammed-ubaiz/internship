import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import axios from "axios";
import { Search, Filter, Users, GraduationCap, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from "lucide-react";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");

  // Get unique batches and courses
  const batches = ["All", ...new Set(students.map((s) => s.batch).filter(Boolean))];
  const courses = ["All", ...new Set(students.map((s) => s.course).filter(Boolean))];

  // --------------------- FETCH STUDENTS ---------------------
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        const res = await axios.get(
          "http://localhost:3001/mentor/getStudents",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Role: role,
            },
          }
        );

        setStudents(res.data || []);
      } catch (error) {
        console.error("Failed to fetch students", error);
        setError(error.response?.data?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Sidebar />

      <div className="ml-0 md:ml-52 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540] font-[Montserrat] mb-2">
                My Students
              </h1>
              <p className="text-gray-600">
                Manage and track all your assigned students
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.reload()}
                disabled={loading}
                className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <strong>Error:</strong> {error}
            </div>
            <button onClick={() => window.location.reload()} className="mt-2 text-sm underline">
              Try again
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batches</p>
                <p className="text-2xl font-bold text-purple-600">{stats.batches}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-amber-600">{stats.courses}</p>
              </div>
              <Filter className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a2540] border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students data...</p>
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
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[#0a2540]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
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
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          
<div className="hidden lg:block overflow-x-auto">
  <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center p-5 mt-2 sticky top-0 backdrop-blur-sm py-4 z-10 rounded-xl">
          {/* Search Bar */}
          <div className="group relative w-full sm:w-72">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <input
                type="text"
                placeholder="Search by name, email or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
              />
              <button className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#0a2540] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                <Search className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-48 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <Filter className="absolute right-4 w-4 h-4 text-[#0a2540]" />
            </div>
          </div>

          {/* Course Filter */}
          <div className="relative w-full sm:w-48 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
              >
                {courses.map((course, index) => (
                  <option key={index} value={course}>
                    {course === "All" ? "All Courses" : course}
                  </option>
                ))}
              </select>
              <GraduationCap className="absolute right-4 w-4 h-4 text-[#0a2540]" />
            </div>
          </div>

          {/* Batch Filter */}
          <div className="relative w-full sm:w-48 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
              >
                {batches.map((batch, index) => (
                  <option key={index} value={batch}>
                    {batch === "All" ? "All Batches" : batch}
                  </option>
                ))}
              </select>
              <Users className="absolute right-4 w-4 h-4 text-[#0a2540]" />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter !== "All" || batchFilter !== "All" || courseFilter !== "All") && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors hover:bg-white rounded-lg flex items-center gap-2"
            >
              Clear All Filters
            </button>
          )}
        </div>
  <table className="w-full text-sm border-separate border-spacing-y-3 p-3">
    <thead className="bg-white">
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
            className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition-all duration-300 hover:scale-[0.99]"
          >
            <td className="px-3 py-3 text-center">{index + 1}</td>

            <td className="px-4 py-3 text-center break-words">
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
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  student.status === "Active"
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
  );
}

export default MyStudents;