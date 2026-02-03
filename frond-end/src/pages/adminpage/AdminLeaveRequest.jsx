import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import {
  CalendarDays,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Search,
  Filter,
  X,
} from "lucide-react";

function AdminLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [availableTypes, setAvailableTypes] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch all pending leave requests
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:3001/admin/leave-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("📋 Admin - Leave requests received:", data);

      const requests = data.leaves || [];
      
      // Extract unique leave types from data
      const types = [
        ...new Set(requests.map((leave) => leave.type).filter(Boolean)),
      ];
      setAvailableTypes(types);

      setLeaveRequests(requests);
      setFilteredRequests(requests);
    } catch (err) {
      console.error("❌ Error fetching leave requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetch("http://localhost:3001/admin/leave-requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setLeaveRequests(data.leaves))
      .catch((err) =>
        console.error("Error fetching leave requests:", err)
      );
    fetchLeaves();
  }, []);

  // Apply both search and filter
  useEffect(() => {
    let result = [...leaveRequests];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (leave) =>
          leave.studentId?.name?.toLowerCase().includes(term) ||
          leave.studentId?.email?.toLowerCase().includes(term) ||
          leave.type?.toLowerCase().includes(term) ||
          leave.reason?.toLowerCase().includes(term) ||
          leave.studentId?.batch?.toLowerCase().includes(term)
      );
    }

    // Apply leave type filter
    if (leaveTypeFilter !== "all") {
      result = result.filter(
        (leave) => leave.type?.toLowerCase() === leaveTypeFilter.toLowerCase()
      );
    }

    setFilteredRequests(result);
  }, [leaveRequests, searchTerm, leaveTypeFilter]);

  // Approve / Reject leave
  const handleStatusChange = async (id, status) => {
    try {


      console.log(`📝 Admin ${status} leave request:`, id);


      const res = await fetch(
        `http://localhost:3001/admin/leave-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );


      if (res.ok) {
        setLeaveRequests((prev) =>
          prev.filter((l) => l._id !== id)
        );

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Leave status updated successfully");
        // Remove approved/rejected leave from UI
        setLeaveRequests((prev) => prev.filter((l) => l._id !== id));
        alert(`Leave ${status.toLowerCase()} successfully!`);
      } else {
        console.error("❌ Failed to update leave:", data.message);
        alert(data.message || "Failed to update leave status");
      }
    } catch (err) {
      console.error("❌ Error updating leave status:", err);
      alert("Something went wrong!");
    }
  };

  // Get leave type color
  const getLeaveTypeColor = (type) => {
    const colors = {
      sick: "bg-red-50 text-red-700 border-red-200",
      casual: "bg-blue-50 text-blue-700 border-blue-200",
      emergency: "bg-orange-50 text-orange-700 border-orange-200",
      medical: "bg-purple-50 text-purple-700 border-purple-200",
      personal: "bg-green-50 text-green-700 border-green-200",
      other: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[type?.toLowerCase()] || colors.other;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setLeaveTypeFilter("all");
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] flex">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 pt-6 md:ml-52">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0a2540] font-[Montserrat] mb-6 text-center md:text-left">
            Leave Requests
          </h2>

          {leaveRequests.length === 0 ? (
            <div className="flex justify-center items-center h-60 bg-white rounded-xl shadow">
              <p className="text-gray-500">
                No pending leave requests
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {leaveRequests.map((leave) => (
                  <div
                    key={leave._id}
                    className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">
                        {leave.studentId?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {leave.studentId?.batch || "Batch A"} |{" "}
                        {leave.studentId?.email}
                      </p>
                      <p className="mt-2">Type: {leave.type}</p>
                      <p>
                        From:{" "}
                        {new Date(leave.from).toLocaleDateString()}
                      </p>
                      <p>
                        To:{" "}
                        {new Date(leave.to).toLocaleDateString()}
                      </p>
                      <p>Reason: {leave.reason}</p>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                        Pending
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              leave._id,
                              "Approved"
                            )
                          }
                          className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              leave._id,
                              "Rejected"
                            )
                          }
                          className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Sidebar />

      <div className="ml-0 md:ml-52 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540] font-[Montserrat] mb-2">
                Leave Requests
              </h1>
              
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchLeaves}
                className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center mb-6 sticky top-0 backdrop-blur-sm py-4 z-10 rounded-xl">
          {/* Search Bar */}
          <div className="group relative w-full sm:w-72">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
              />
              <button className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#0a2540] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                <Search className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
              </button>
            </div>
          </div>

          {/* Leave Type Filter */}
          <div className="relative w-full sm:w-64 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
              >
                <option value="all">All Leave Types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-4 w-4 h-4 text-[#0a2540] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180" />
            </div>
          </div>

          {/* Clear Filters Button (only shown when filters are active) */}
          {(searchTerm || leaveTypeFilter !== "all") && (
            <button
              onClick={clearAllFilters}
              className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Clear All
            </button>
          )}

          {/* Active Filters Display */}
          {(searchTerm || leaveTypeFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {leaveTypeFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Type: {leaveTypeFilter}
                  <button
                    onClick={() => setLeaveTypeFilter("all")}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a2540] border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leave requests...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Error Loading Requests
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchLeaves}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-[#0a2540]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {leaveRequests.length === 0
                ? "No Pending Requests"
                : "No Matching Requests"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {leaveRequests.length === 0
                ? "All leave requests have been reviewed. Check back later for new requests."
                : "No leave requests match your current search and filter criteria."}
            </p>
            {(searchTerm || leaveTypeFilter !== "all") && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((leave) => (
              <div
                key={leave._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-[#0a2540]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#0a2540]">
                          {leave.studentId?.name || "Unknown Student"}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${getLeaveTypeColor(
                              leave.type
                            )}`}
                          >
                            {leave.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {leave.studentId?.batch || "Batch A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                      Pending
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{leave.studentId?.email || "No email"}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays className="w-4 h-4" />
                        <span>From</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {new Date(leave.from).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays className="w-4 h-4" />
                        <span>To</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {new Date(leave.to).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Reason</span>
                  </div>

                  <div className="relative bg-gray-50 rounded-lg h-25 p-3">
                    <div className="max-h-20 overflow-y-auto pr-2">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {leave.reason}
                      </p>
                    </div>
                    {/* Bottom fade effect for long content */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleStatusChange(leave._id, "Rejected")}
                      className="px-5 py-2.5 text-sm font-medium rounded-lg border border-red-600 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(leave._id, "Approved")}
                      className="px-5 py-2.5 text-sm font-medium rounded-lg bg-[#0a2540] text-white hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

            ))}
          </div>
        )}

        {/* Stats Bar */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <div className="text-gray-500">
                {searchTerm || leaveTypeFilter !== "all" ? (
                  <>
                    Found{" "}
                    <span className="font-semibold text-[#0a2540]">
                      {filteredRequests.length}
                    </span>{" "}
                    result
                    {filteredRequests.length !== 1 ? "s" : ""}
                    {searchTerm && (
                      <>
                        {" "}
                        for "<span className="font-semibold">{searchTerm}</span>
                        "
                      </>
                    )}
                    {leaveTypeFilter !== "all" && (
                      <>
                        {" "}
                        with type "
                        <span className="font-semibold">{leaveTypeFilter}</span>
                        "
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Showing all{" "}
                    <span className="font-semibold">
                      {filteredRequests.length}
                    </span>{" "}
                    pending leave requests
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                {(searchTerm || leaveTypeFilter !== "all") && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[#0a2540] hover:underline text-sm flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear Filters
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#0a2540] rounded-full"></div>
                  <span className="text-gray-600">Awaiting Action</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Refresh icon component
const RefreshCw = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export default AdminLeaveRequest;