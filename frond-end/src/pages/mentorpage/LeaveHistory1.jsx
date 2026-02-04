import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";

function LeaveHistoryMentor() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch leaves from backend
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/mentor/leave-history", {
        params: {
          status: statusFilter !== "All" ? statusFilter : undefined,
          search: search || undefined
        }
      });

      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError(err.response?.data?.message || "Failed to fetch leave history");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + refresh on filter change
  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaves();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Helper to style status badges
  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      {/* Sidebar */}
      <Sidebar />

      <div className="ml-0 lg:ml-52 p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat]">
            Leave History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Student Leave Records (Your Course Students Only)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Total Leaves</p>
            <p className="text-2xl font-bold text-[#0a2540]">{leaves.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {leaves.filter(l => l.status === "Approved").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {leaves.filter(l => l.status === "Rejected").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {leaves.filter(l => l.status === "Pending").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
          <button
            onClick={fetchLeaves}
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
            <button onClick={fetchLeaves} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : leaves.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No leave history found</p>
            <p className="text-gray-400 text-sm mt-2">
              {statusFilter !== "All"
                ? `No ${statusFilter.toLowerCase()} leaves found.`
                : "No leave records available for your students."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaves.map((leave) => (
              <div
                key={leave._id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl cursor-pointer flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.02]"
              >
                <div>
                  <h3 className="font-semibold text-lg text-[#0a2540]">
                    {leave.studentName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {leave.course} | {leave.batch}
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-gray-700">
                      <span className="font-medium">Type:</span> {leave.type}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">From:</span> {leave.from}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">To:</span> {leave.to}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Reason:</span> {leave.reason}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-start items-center">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusStyle(
                      leave.status
                    )}`}
                  >
                    {leave.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {!loading && leaves.length > 0 && (
          <div className="mt-6 text-sm text-gray-500 text-right">
            Showing {leaves.length} leave records
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveHistoryMentor;
