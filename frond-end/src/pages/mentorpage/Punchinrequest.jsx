import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import api from "../../utils/axiosConfig";
import {
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User,
  Activity,
} from "lucide-react";

function Punchinrequest() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [mentorCourse, setMentorCourse] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // FETCH MENTOR INFO
  useEffect(() => {
    fetchMentorInfo();
  }, []);

  const fetchMentorInfo = async () => {
    try {
      const res = await api.get("/mentor/profile");
      const course = res.data?.course || res.data?.data?.course || "";
      setMentorCourse(course);
      console.log(`👨‍🏫 Mentor's course: ${course}`);
    } catch (err) {
      console.error("❌ Error fetching mentor info:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/mentor/punch-requests", {
        params: { includeAll: true },
      });

      const allRequests = res.data || [];
      console.log("📦 Requests from API (already filtered by course):", allRequests.length);

      const pendings = allRequests.filter((r) => r.status === "PENDING");
      const history = allRequests.filter((r) => r.status !== "PENDING");

      const sortedHistory = history.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );

      setPendingRequests(pendings);
      setHistoryRequests(sortedHistory);

      console.log("📊 Stats:", {
        pending: pendings.length,
        approved: history.filter((r) => r.status === "APPROVED").length,
        rejected: history.filter((r) => r.status === "REJECTED").length,
        total: allRequests.length,
      });
    } catch (error) {
      console.error("❌ Error fetching requests:", error);
    }
  };

  const accept = async (id) => {
    try {
      setLoading(true);
      setProcessingId(id);

      let response;
      try {
        response = await api.post(`/mentor/punch-requests/${id}/accept`);
      } catch (err1) {
        console.warn("❌ First endpoint failed, trying alternative...");
        try {
          response = await api.patch(`/mentor/punch-requests/${id}`, {
            status: 'APPROVED'
          });
        } catch (err2) {
          console.warn("❌ Second endpoint failed, trying alternative...");
          try {
            response = await api.put(`/mentor/punch-requests/${id}/accept`);
          } catch (err3) {
            response = await api.post(`/mentor/punch-request/${id}/accept`);
          }
        }
      }

      console.log("✅ Accept response:", response.data);
      await fetchRequests();
      alert("✅ Request accepted successfully!");
      setActiveTab("accepted");
    } catch (error) {
      console.error("❌ Error accepting:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to accept request";
      alert(`❌ Failed: ${errorMessage}`);
      
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
    } finally {
      setProcessingId(null);
      setLoading(false);
    }
  };

  const reject = async (id) => {
    try {
      setLoading(true);
      setProcessingId(id);

      let response;
      try {
        response = await api.post(`/mentor/punch-requests/${id}/reject`, {
          reason: "Invalid punch"
        });
      } catch (err1) {
        console.warn("❌ First endpoint failed, trying alternative...");
        try {
          response = await api.patch(`/mentor/punch-requests/${id}`, {
            status: 'REJECTED',
            reason: "Invalid punch"
          });
        } catch (err2) {
          console.warn("❌ Second endpoint failed, trying alternative...");
          try {
            response = await api.put(`/mentor/punch-requests/${id}/reject`, {
              reason: "Invalid punch"
            });
          } catch (err3) {
            response = await api.post(`/mentor/punch-request/${id}/reject`, {
              reason: "Invalid punch"
            });
          }
        }
      }

      console.log("✅ Reject response:", response.data);
      await fetchRequests();
      alert("✅ Request rejected successfully!");
      setActiveTab("rejected");
    } catch (error) {
      console.error("❌ Error rejecting:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to reject request";
      alert(`❌ Failed: ${errorMessage}`);
      
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
    } finally {
      setProcessingId(null);
      setLoading(false);
    }
  };

  const allRequests = [...pendingRequests, ...historyRequests];

  const filteredRequests = (() => {
    const today = new Date().toDateString();
    let requests = [];
    
    switch (activeTab) {
      case "pending":
        requests = pendingRequests;
        break;
      case "accepted":
        requests = historyRequests.filter((req) => req.status === "APPROVED");
        break;
      case "rejected":
        requests = historyRequests.filter((req) => req.status === "REJECTED");
        break;
      case "acceptedToday":
        requests = historyRequests.filter(
          (req) =>
            req.status === "APPROVED" &&
            new Date(req.updatedAt || req.createdAt).toDateString() === today
        );
        break;
      case "rejectedToday":
        requests = historyRequests.filter(
          (req) =>
            req.status === "REJECTED" &&
            new Date(req.updatedAt || req.createdAt).toDateString() === today
        );
        break;
      case "all":
        requests = allRequests;
        break;
      default:
        requests = pendingRequests;
    }

    // Apply search filter
    if (search) {
      requests = requests.filter((req) => {
        const studentName = req.studentId?.name?.toLowerCase() || "";
        const batch = req.studentId?.batch?.toLowerCase() || "";
        const course = req.studentId?.course?.toLowerCase() || "";
        return studentName.includes(search.toLowerCase()) ||
               batch.includes(search.toLowerCase()) ||
               course.includes(search.toLowerCase());
      });
    }

    // Apply sort
    return requests.sort((a, b) => {
      const timeA = new Date(a.requestTime || a.createdAt);
      const timeB = new Date(b.requestTime || b.createdAt);
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  })();

  const pendingCount = pendingRequests.length;
  const acceptedCount = historyRequests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = historyRequests.filter((r) => r.status === "REJECTED").length;

  const today = new Date().toDateString();
  const acceptedTodayCount = historyRequests.filter(
    (r) =>
      r.status === "APPROVED" &&
      new Date(r.updatedAt || r.createdAt).toDateString() === today
  ).length;
  const rejectedTodayCount = historyRequests.filter(
    (r) =>
      r.status === "REJECTED" &&
      new Date(r.updatedAt || r.createdAt).toDateString() === today
  ).length;
  const totalRequests = allRequests.length;

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "--:--";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const clearAllFilters = () => {
    setSearch("");
    setSortOrder("desc");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-14 lg:pt-0">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-52 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header - centered on mobile */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#0a2540] font-[Montserrat] mb-2">
            Punch-in Requests
          </h1>
          <p className="text-gray-600">
            Review and manage student attendance requests
            {mentorCourse && (
              <span className="ml-2 text-blue-600 font-medium">• {mentorCourse}</span>
            )}
          </p>
        </div>
        <div className="mb-6 flex justify-center md:justify-end">
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Stats Cards - 3 Cards like DailyAttendance */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* Pending Requests Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
                {pendingCount > 0 && (
                  <p className="text-xs text-yellow-500 mt-1">Needs review</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Accepted Today Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {acceptedTodayCount}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Rejected Today Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold text-red-600">
                  {rejectedTodayCount}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Main Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Filter Bar & Tabs - visible on all screens */}
          <div className="p-5 bg-white border-b border-gray-100">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center mb-4">
              <div className="group relative w-full sm:w-72">
                <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-[#0a2540]/40">
                  <input
                    type="text"
                    placeholder="Search by name, batch, course..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none rounded-full"
                  />
                  <button type="button" className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#0a2540] transition-all duration-300">
                    <Search className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="relative w-full sm:w-48 group">
                <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-[#0a2540]/40">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                  <Filter className="absolute right-4 w-4 h-4 text-[#0a2540]" />
                </div>
              </div>

              {(search || sortOrder !== "desc") && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Tabs - visible on mobile too */}
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap -mb-px overflow-x-auto">
                {[
                  { key: "pending", label: "Pending", count: pendingCount },
                  { key: "accepted", label: "Accepted", count: acceptedCount },
                  { key: "rejected", label: "Rejected", count: rejectedCount },
                  { key: "acceptedToday", label: "Accepted Today", count: acceptedTodayCount },
                  { key: "rejectedToday", label: "Rejected Today", count: rejectedTodayCount },
                  { key: "all", label: "All Requests", count: totalRequests },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center px-4 py-3 mr-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? "border-[#1679AB] text-[#1679AB]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-2.5 py-0.5 text-xs rounded-full ${
                      activeTab === tab.key
                        ? "bg-[#1679AB] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-y-3 p-3">
                <thead className="bg-white">
                  <tr className="text-[#1679AB] text-left">
                    <th className="p-3 text-center">#</th>
                    <th className="p-3">Student</th>
                    <th className="p-3 text-center">Batch</th>
                    <th className="p-3 text-center">Course</th>
                    <th className="p-3 text-center">Time</th>
                    <th className="p-3 text-center">Distance</th>
                    <th className="p-3 text-center">Type</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr className="bg-[#EEF6FB]">
                      <td colSpan="9" className="text-center p-6 rounded-2xl">
                        <div className="flex justify-center">
                          <div className="animate-spin h-6 w-6 border-2 border-[#1679AB] border-t-transparent rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                      <td colSpan="9" className="text-center p-6 rounded-2xl text-gray-500">
                        <div className="flex flex-col items-center">
                          <Activity className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-lg font-medium">No requests found</p>
                          <p className="text-sm mt-2">
                            {activeTab === "pending"
                              ? `No pending punch-in requests from ${mentorCourse || "your course"} students`
                              : `No ${activeTab.replace(/([A-Z])/g, " $1").toLowerCase()} requests found`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req, index) => (
                      <tr
                        key={req._id}
                        className={`bg-[#EEF6FB] hover:bg-[#D1E8FF] transition-all duration-300 hover:scale-[0.99] ${
                          processingId === req._id ? "opacity-60 pointer-events-none" : ""
                        }`}
                      >
                        <td className="px-3 py-3 text-center rounded-l-2xl">
                          <div className="flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                              {req.studentId?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{req.studentId?.name || "Unknown"}</div>
                              <div className="text-xs text-gray-500">ID: {req.studentId?._id?.slice(-6) || "N/A"}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {req.studentId?.batch || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                            {req.studentId?.course || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="font-medium text-gray-900 font-mono">
                            {formatTime(req.requestTime || req.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(req.requestTime || req.createdAt)}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className={`font-medium font-mono ${req.distance <= 100 ? "text-green-600" : "text-red-600"}`}>
                              {Math.round(req.distance || 0)}m
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            req.type === "PUNCH_IN" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                          }`}>
                            {req.type.replace("_", " ")}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            req.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : req.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {req.status === "APPROVED" ? "ACCEPTED" : req.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center rounded-r-2xl">
                          {req.status === "PENDING" ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => accept(req._id)}
                                disabled={loading || processingId === req._id}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {processingId === req._id ? "..." : "Accept"}
                              </button>
                              <button
                                onClick={() => reject(req._id)}
                                disabled={loading || processingId === req._id}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              >
                                <XCircle className="w-3 h-3" />
                                {processingId === req._id ? "..." : "Reject"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs italic flex items-center justify-center gap-1">
                              {req.status === "APPROVED" ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  Accepted
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  Rejected
                                </>
                              )}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          {/* Mobile Card View - DailyAttendance Style */}
          <div className="block lg:hidden p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-[#1679AB] border-t-transparent rounded-full"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-[#EEF6FB] rounded-xl p-6 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Requests</h3>
                <p className="text-gray-500">No punch-in requests to display</p>
              </div>
            ) : (
              filteredRequests.map((req, idx) => (
                <div
                  key={req._id}
                  className="bg-[#EEF6FB] p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-[#D1E8FF] transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {req.studentId?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0a2540]">{req.studentId?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{req.studentId?.batch || "N/A"}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : req.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-600">Time</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm font-mono">
                        {formatTime(req.requestTime || req.createdAt)}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <p className="text-xs text-gray-600">Distance</p>
                      </div>
                      <p className={`font-semibold text-sm font-mono ${
                        req.distance <= 100 ? "text-green-600" : "text-red-600"
                      }`}>
                        {Math.round(req.distance || 0)}m
                      </p>
                    </div>
                  </div>

                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => accept(req._id)}
                        disabled={loading || processingId === req._id}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => reject(req._id)}
                        disabled={loading || processingId === req._id}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer - DailyAttendance Style */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <div className="text-gray-500">
                Showing{" "}
                <span className="font-semibold text-[#0a2540]">
                  {filteredRequests.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {activeTab === "pending" ? pendingCount :
                   activeTab === "accepted" ? acceptedCount :
                   activeTab === "rejected" ? rejectedCount :
                   activeTab === "acceptedToday" ? acceptedTodayCount :
                   activeTab === "rejectedToday" ? rejectedTodayCount :
                   totalRequests}
                </span>{" "}
                requests
                {mentorCourse && <span className="ml-2">from {mentorCourse}</span>}
              </div>
              
              {(search || sortOrder !== "desc") && (
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
      </div>
    </div>
  );
}

export default Punchinrequest;