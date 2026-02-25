import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";
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

function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");
  const [availableTypes, setAvailableTypes] = useState([]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/mentor/leave-history");

      if (res.data.success) {
        const data = res.data.leaves || [];
        setLeaves(data);
        setFilteredLeaves(data);

        const types = [
          ...new Set(data.map((leave) => leave.type).filter(Boolean)),
        ];
        setAvailableTypes(types);
      }
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError(err.response?.data?.message || "Failed to fetch leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    let result = [...leaves];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (leave) =>
          leave.studentName?.toLowerCase().includes(term) ||
          leave.course?.toLowerCase().includes(term) ||
          leave.batch?.toLowerCase().includes(term) ||
          leave.type?.toLowerCase().includes(term) ||
          leave.reason?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (leave) => leave.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (leaveTypeFilter !== "all") {
      result = result.filter(
        (leave) => leave.type?.toLowerCase() === leaveTypeFilter.toLowerCase()
      );
    }

    setFilteredLeaves(result);
  }, [leaves, searchTerm, statusFilter, leaveTypeFilter]);

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

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle };
      case "rejected":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
      case "pending":
        return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: Clock };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: AlertCircle };
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLeaveTypeFilter("all");
  };

  const approvedCount = leaves.filter((l) => l.status === "Approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "Rejected").length;
  const pendingCount = leaves.filter((l) => l.status === "Pending").length;

  return (
    <div className="min-h-screen bg-[#EEF6FB]">
      <Sidebar />

      <div className="lg:ml-64 flex-1 min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#0a2540]">
              Leave History
            </h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#0a2540]">
              Leave History
            </h2>
            <p className="text-gray-600 mt-1">Student leave records from your course</p>
          </div>

          {/* Refresh Button */}
          <div className="mb-6 flex justify-center md:justify-end">
            <button
              onClick={fetchLeaves}
              disabled={loading}
              className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-5">
              <p className="text-sm text-gray-600">Total Leaves</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0a2540]">{leaves.length}</p>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-green-200 p-4 sm:p-5">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-red-200 p-4 sm:p-5">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-yellow-200 p-4 sm:p-5">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:gap-4 items-stretch lg:items-center px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sticky top-0 backdrop-blur-sm z-10 bg-[#EEF6FB] border-b border-gray-100 rounded-xl">
            {/* Search Bar */}
            <div className="group relative w-full lg:w-72">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                <input
                  type="text"
                  placeholder="Search leaves..."
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
            <div className="relative w-full lg:w-48 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
                <Filter className="absolute right-4 w-4 h-4 text-[#0a2540] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180" />
              </div>
            </div>

            {/* Leave Type Filter */}
            <div className="relative w-full lg:w-48 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
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

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
              <button onClick={clearAllFilters} className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors">
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Clear All
              </button>
            )}

            {/* Active Filters Display */}
            {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-blue-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-blue-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {leaveTypeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Type: {leaveTypeFilter}
                    <button onClick={() => setLeaveTypeFilter("all")} className="ml-1 hover:text-blue-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading History</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchLeaves} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Try Again
              </button>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border p-8 sm:p-12 text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[#0a2540]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {leaves.length === 0 ? "No Leave Records" : "No Matching Records"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {leaves.length === 0 ? "No leave records found for your course students." : "No leave records match your current search and filter criteria."}
              </p>
              {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
                <button onClick={clearAllFilters} className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className=" overflow-hidden">
              {/* Mobile Card View */}
              <div className="block lg:hidden px-4 sm:px-6 pb-4 pt-4 space-y-4">
                {filteredLeaves.map((leave) => {
                  const statusBadge = getStatusBadge(leave.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div key={leave._id} className="bg-[#EEF6FB] rounded-xl p-4 transform transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-[#0a2540]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#0a2540] text-sm">{leave.studentName}</h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getLeaveTypeColor(leave.type)}`}>
                              {leave.type}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {leave.status}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">{leave.course} | {leave.batch || "Batch A"}</div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white/60 p-2 rounded-lg">
                          <p className="text-xs text-gray-600">From</p>
                          <p className="font-medium text-gray-900 text-xs">
                            {new Date(leave.from).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <div className="bg-white/60 p-2 rounded-lg">
                          <p className="text-xs text-gray-600">To</p>
                          <p className="font-medium text-gray-900 text-xs">
                            {new Date(leave.to).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/60 rounded-lg p-2 mb-3">
                        <p className="text-xs text-gray-500 mb-1">Reason</p>
                        <p className="text-xs text-gray-700 line-clamp-2">{leave.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Card View */}
              <div className="hidden lg:block px-4 sm:px-6 lg:px-8 pb-4 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredLeaves.map((leave) => {
                    const statusBadge = getStatusBadge(leave.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <div key={leave._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-[#0a2540]" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-[#0a2540]">{leave.studentName}</h3>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getLeaveTypeColor(leave.type)}`}>
                                    {leave.type}
                                  </span>
                                  <span className="text-sm text-gray-500">{leave.batch || "Batch A"}</span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                              <StatusIcon className="w-3 h-3" />
                              {leave.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                            <BookOpen className="w-4 h-4" />
                            <span>{leave.course}</span>
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
                                {new Date(leave.from).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarDays className="w-4 h-4" />
                                <span>To</span>
                              </div>
                              <p className="font-medium text-gray-900">
                                {new Date(leave.to).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Clock className="w-4 h-4" />
                            <span>Reason</span>
                          </div>

                          <div className="relative bg-gray-50 rounded-lg h-25 p-3">
                            <div className="max-h-20 overflow-y-auto pr-2">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{leave.reason}</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          {!loading && !error && filteredLeaves.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="text-gray-500">
                  {searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all" ? (
                    <>
                      Found <span className="font-semibold text-[#0a2540]">{filteredLeaves.length}</span> result{filteredLeaves.length !== 1 ? "s" : ""}
                      {searchTerm && <> for "<span className="font-semibold">{searchTerm}</span>"</>}
                    </>
                  ) : (
                    <>
                      Showing all <span className="font-semibold">{filteredLeaves.length}</span> leave records
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
                    <button onClick={clearAllFilters} className="text-[#0a2540] hover:underline text-sm flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Clear Filters
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#0a2540] rounded-full"></div>
                    <span className="text-gray-600">Leave Records</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const RefreshCw = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default LeaveHistory;

