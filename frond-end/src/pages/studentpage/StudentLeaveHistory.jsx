import React, { useEffect, useState, useMemo } from "react";
import SideBarStudent from "./SideBarStudent";
import api from "../../utils/axiosConfig";
import { Search, Filter, X } from "lucide-react";

function StudentLeaveHistory() {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");

  useEffect(() => {
    fetchLeaves();
    const student = JSON.parse(localStorage.getItem("student") || "{}");
    setStudentName(student.name || "Student");
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get("/student/my-leaves");
      if (response.data.success) {
        setLeaveData(response.data.leaves || []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableTypes = useMemo(() => {
    const types = [...new Set(leaveData.map((l) => l.type).filter(Boolean))];
    return types;
  }, [leaveData]);

  const filteredLeaves = useMemo(() => {
    return leaveData.filter((leave) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        (leave.type && leave.type.toLowerCase().includes(term)) ||
        (leave.reason && leave.reason.toLowerCase().includes(term)) ||
        (leave.from && leave.from.toLowerCase().includes(term)) ||
        (leave.to && leave.to.toLowerCase().includes(term));
      const matchesStatus =
        statusFilter === "all" ||
        (leave.status && leave.status.toLowerCase() === statusFilter.toLowerCase());
      const matchesType =
        leaveTypeFilter === "all" ||
        (leave.type && leave.type.toLowerCase() === leaveTypeFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaveData, searchTerm, statusFilter, leaveTypeFilter]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLeaveTypeFilter("all");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
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
    <div className="min-h-screen bg-[#eef5f9] pt-14 lg:pt-0">
      <div className="fixed left-0 top-0 h-screen w-64 z-40">
        <SideBarStudent />
      </div>

      <div className="ml-0 lg:ml-64 flex-1 min-h-screen p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">
        <div className="mb-6 sm:mb-8 text-center lg:text-left">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0a2540] break-words">
            Leave History - {studentName}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
            Track all your applied leaves
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center lg:text-left text-[#0a2540] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
            Leave Application Records
          </h3>

          {/* Search and Filter - same design & animation as admin Leave History */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center px-4 sm:px-6 lg:px-8 pb-4 sticky top-0 backdrop-blur-sm z-10 bg-white border-b border-gray-100">
            <div className="group relative w-full sm:w-72">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                <input
                  type="text"
                  placeholder="Search by reason, type, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none rounded-full"
                />
                <button type="button" className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#0a2540] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                  <Search className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-48 group">
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

            <div className="relative w-full sm:w-48 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                <select
                  value={leaveTypeFilter}
                  onChange={(e) => setLeaveTypeFilter(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
                >
                  <option value="all">All Types</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-4 w-4 h-4 text-[#0a2540] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180" />
              </div>
            </div>

            {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
              <button
                onClick={clearAllFilters}
                className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors hover:bg-gray-50 rounded-lg"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Clear All
              </button>
            )}

            {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Search: &quot;{searchTerm}&quot;
                    <button type="button" onClick={() => setSearchTerm("")} className="ml-1 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Status: {statusFilter}
                    <button type="button" onClick={() => setStatusFilter("all")} className="ml-1 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {leaveTypeFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Type: {leaveTypeFilter}
                    <button type="button" onClick={() => setLeaveTypeFilter("all")} className="ml-1 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 lg:p-8 pt-0">
          {loading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col sm:flex-row sm:space-x-4 gap-2 sm:gap-0 py-4 border-b border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
                  <div className="h-4 sm:h-4 bg-gray-200 rounded flex-1 min-w-0"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 sm:w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden lg:block overflow-x-auto -mx-2">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="text-left text-[#0077b6] border-b-2 border-gray-200">
                      <th className="px-3 sm:px-4 py-3 text-sm font-semibold">From</th>
                      <th className="px-3 sm:px-4 py-3 text-sm font-semibold">To</th>
                      <th className="px-3 sm:px-4 py-3 text-sm font-semibold">Type</th>
                      <th className="px-3 sm:px-4 py-3 text-sm font-semibold">Reason</th>
                      <th className="px-3 sm:px-4 py-3 text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-400 text-sm">
                          {leaveData.length === 0 ? "No leave records found" : "No matching records"}
                        </td>
                      </tr>
                    ) : (
                      filteredLeaves.map((leave) => (
                        <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                          <td className="px-3 sm:px-4 py-3 text-sm">{formatDate(leave.from)}</td>
                          <td className="px-3 sm:px-4 py-3 text-sm">{formatDate(leave.to)}</td>
                          <td className="px-3 sm:px-4 py-3 text-sm">{leave.type}</td>
                          <td className="px-3 sm:px-4 py-3 text-sm max-w-[200px] lg:max-w-xs break-words align-top whitespace-pre-wrap">
                            {leave.reason || "—"}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusStyle(
                                leave.status
                              )}`}
                            >
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="block lg:hidden space-y-3">
                {filteredLeaves.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {leaveData.length === 0 ? "No leave records found" : "No matching records"}
                  </div>
                ) : (
                  filteredLeaves.map((leave) => (
                    <div
                      key={leave._id}
                      className="bg-[#EEF6FB] p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform"
                    >
                      <p className="font-medium text-[#0a2540] text-sm sm:text-base mb-1">
                        {formatDate(leave.from)} → {formatDate(leave.to)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{leave.type}</p>
                      <p className="text-xs sm:text-sm text-gray-700 mb-1 font-medium">Reason:</p>
                      <p className="text-xs sm:text-sm text-gray-700 bg-white/60 p-3 rounded-lg whitespace-pre-wrap break-words min-h-[2.5rem]">
                        {leave.reason || "—"}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Footer - same as other pages */}
              <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 rounded-b-2xl sm:rounded-b-3xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                  <div className="text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-[#0a2540]">{filteredLeaves.length}</span> of{" "}
                    <span className="font-semibold">{leaveData.length}</span> leave records
                  </div>
                  {(searchTerm || statusFilter !== "all" || leaveTypeFilter !== "all") && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-[#0a2540] hover:underline flex items-center gap-1"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLeaveHistory;
