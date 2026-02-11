import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/axiosConfig";
import SideBarStudent from "./SideBarStudent";
import {
  Search,
  Calendar,
  RefreshCw,
  AlertCircle,
  Filter,
  Clock,
  LogIn,
  LogOut,
  PauseCircle,
  Activity,
  TrendingUp,
} from "lucide-react";

function DailyAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [punchRecords, setPunchRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Live timer states
  const [liveWorkingSeconds, setLiveWorkingSeconds] = useState(0);
  const [liveBreakSeconds, setLiveBreakSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchAttendance();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (attendance) {
      updateLiveTime();

      const hasActiveSession = punchRecords.some(r => !r.punchOut);
      const isOnBreak = attendance.currentBreakStart;

      if (hasActiveSession || isOnBreak) {
        timerRef.current = setInterval(() => {
          updateLiveTime();
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [attendance, punchRecords]);

  const updateLiveTime = () => {
    if (!attendance) return;

    let baseWorking = attendance.totalWorkingSeconds || 0;
    let baseBreak = attendance.totalBreakSeconds || 0;

    // Find active session and calculate live working time
    const activeRecord = punchRecords.find(r => !r.punchOut);
    if (activeRecord && !attendance.currentBreakStart) {
      const now = new Date();
      const punchInTime = new Date(activeRecord.punchIn);
      const additionalSeconds = Math.floor((now - punchInTime) / 1000);
      setLiveWorkingSeconds(baseWorking + additionalSeconds);
    } else {
      setLiveWorkingSeconds(baseWorking);
    }

    // Calculate live break time
    if (attendance.currentBreakStart) {
      const now = new Date();
      const breakStart = new Date(attendance.currentBreakStart);
      const additionalBreakSeconds = Math.floor((now - breakStart) / 1000);
      setLiveBreakSeconds(baseBreak + additionalBreakSeconds);
    } else {
      setLiveBreakSeconds(baseBreak);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/student/today-attendance");

      const attendanceData = res.data.attendance;

      if (attendanceData) {
        setAttendance(attendanceData);

        if (attendanceData.punchRecords && Array.isArray(attendanceData.punchRecords)) {
          setPunchRecords(attendanceData.punchRecords);
        } else if (attendanceData.punchInTime) {
          setPunchRecords([
            {
              punchIn: attendanceData.punchInTime,
              punchOut: attendanceData.punchOutTime,
              _id: "legacy-record",
            },
          ]);
        } else {
          setPunchRecords([]);
        }

        setLiveWorkingSeconds(attendanceData.totalWorkingSeconds || 0);
        setLiveBreakSeconds(attendanceData.totalBreakSeconds || 0);
      } else {
        setAttendance(null);
        setPunchRecords([]);
        setLiveWorkingSeconds(0);
        setLiveBreakSeconds(0);
      }

      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch attendance");
      setAttendance(null);
      setPunchRecords([]);
      setLoading(false);
    }
  };

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
      weekday: 'short',
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return "00h 00m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDurationDetailed = (seconds) => {
    if (!seconds || seconds < 0) return "00h 00m 00s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const hasActiveSession = punchRecords.some(r => !r.punchOut);
  const isOnBreak = attendance?.currentBreakStart;
  const currentStatus = attendance?.status || "NOT_STARTED";

  const calculateAttendancePercentage = () => {
    if (!attendance) return 0;
    const expectedWorkingHours = 8 * 3600;
    const actualWorkingSeconds = liveWorkingSeconds;
    return Math.min(Math.round((actualWorkingSeconds / expectedWorkingHours) * 100), 100);
  };

  const attendancePercentage = calculateAttendancePercentage();

  const filteredPunchRecords = punchRecords
    .filter((record) => {
      const punchInTime = formatTime(record.punchIn).toLowerCase();
      const punchOutTime = record.punchOut ? formatTime(record.punchOut).toLowerCase() : "";
      return punchInTime.includes(search.toLowerCase()) || 
             punchOutTime.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      const timeA = new Date(a.punchIn);
      const timeB = new Date(b.punchIn);
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

  const clearAllFilters = () => {
    setSearch("");
    setSortOrder("asc");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SideBarStudent />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6">
        {/* Header - MonthlySummary Style */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2540] font-[Montserrat] mb-2">
                Today's Attendance
              </h1>
              <p className="text-gray-600">
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchAttendance}
                disabled={loading}
                className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message - MonthlySummary Style */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <strong>Error:</strong> {error}
            </div>
            <button onClick={fetchAttendance} className="mt-2 text-sm underline">
              Try again
            </button>
          </div>
        )}

        {/* Stats Cards - 3 Cards Only */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* Date Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-2xl font-bold">
                  {attendance ? formatDate(attendance.date) : formatDate(new Date())}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Working Time Card */}
          <div className={`bg-white p-5 rounded-xl shadow-sm border ${hasActiveSession && !isOnBreak ? 'border-green-300' : 'border-gray-200'} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">Working Time</p>
                  {hasActiveSession && !isOnBreak && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  )}
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatDuration(liveWorkingSeconds)}
                </p>
                {hasActiveSession && !isOnBreak && (
                  <p className="text-xs text-green-500 mt-1">Live updating</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Break Time Card */}
          <div className={`bg-white p-5 rounded-xl shadow-sm border ${isOnBreak ? 'border-orange-300' : 'border-gray-200'} p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">Break Time</p>
                  {isOnBreak && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  )}
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatDuration(liveBreakSeconds)}
                </p>
                {isOnBreak && (
                  <p className="text-xs text-orange-500 mt-1">On break</p>
                )}
              </div>
              <PauseCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Session Summary */}
        {punchRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* First Punch In Summary */}
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">First Punch In</h3>
                  <p className="text-sm text-gray-500">Start of day session</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-700 font-mono">
                  {formatTime(punchRecords[0]?.punchIn)}
                </p>
                {hasActiveSession && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm text-green-600 font-medium">Session Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Last Punch Out Summary */}
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Last Punch Out</h3>
                  <p className="text-sm text-gray-500">End of session</p>
                </div>
              </div>
              <div className="text-center">
                {punchRecords[punchRecords.length - 1]?.punchOut ? (
                  <p className="text-3xl font-bold text-gray-700 font-mono">
                    {formatTime(punchRecords[punchRecords.length - 1]?.punchOut)}
                  </p>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-yellow-600">Still Working</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className="inline-flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      <span className="text-sm text-yellow-600">Not punched out yet</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Punch Records Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="hidden lg:block">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center p-5 mt-2 bg-white border-b">
              {/* Search Bar */}
              <div className="group relative w-full sm:w-72">
                <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
                  <input
                    type="text"
                    placeholder="Search by time..."
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
                    <option value="asc">Oldest First</option>
                    <option value="desc">Newest First</option>
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

            {/* TABLE - MonthlySummary Style */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-y-3 p-3">
                <thead className="bg-white">
                  <tr className="text-[#1679AB] text-left">
                    <th className="p-3 text-center">#</th>
                    <th className="p-3 text-center">Session</th>
                    <th className="p-3 text-center">Punch In</th>
                    <th className="p-3 text-center">Punch Out</th>
                    <th className="p-3 text-center">Duration</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr className="bg-[#EEF6FB]">
                      <td colSpan="6" className="text-center p-6 rounded-2xl">
                        <div className="flex justify-center">
                          <div className="animate-spin h-6 w-6 border-2 border-[#1679AB] border-t-transparent rounded-full"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPunchRecords.length === 0 && punchRecords.length === 0 ? (
                    <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                      <td colSpan="6" className="text-center p-6 rounded-2xl text-gray-500">
                        <div className="flex flex-col items-center">
                          <Clock className="w-10 h-10 text-gray-400 mb-2" />
                          <p>No punch records today</p>
                          <p className="text-sm text-gray-400">Punch in to start tracking</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPunchRecords.length === 0 ? (
                    <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                      <td colSpan="6" className="text-center p-4 rounded-2xl text-gray-500">
                        No matching records found
                      </td>
                    </tr>
                  ) : (
                    filteredPunchRecords.map((record, index) => {
                      const isActive = !record.punchOut;
                      const duration = isActive ? 
                        Math.floor((new Date() - new Date(record.punchIn)) / 1000) :
                        Math.floor((new Date(record.punchOut) - new Date(record.punchIn)) / 1000);

                      return (
                        <tr
                          key={record._id || index}
                          className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition-all duration-300 hover:scale-[0.99]"
                        >
                          <td className="px-3 py-3 text-center rounded-l-2xl">
                            <div className="flex items-center justify-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isActive ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">Session {index + 1}</span>
                              {isActive && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                  <span className="text-xs text-green-600 font-medium">Active</span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <LogIn className="w-4 h-4 text-blue-500" />
                              <span className="font-medium font-mono">{formatTime(record.punchIn)}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            {record.punchOut ? (
                              <div className="flex items-center justify-center gap-2">
                                <LogOut className="w-4 h-4 text-gray-500" />
                                <span className="font-medium font-mono">{formatTime(record.punchOut)}</span>
                              </div>
                            ) : (
                              <span className="text-yellow-600 font-medium flex items-center justify-center gap-2">
                                <Activity className="w-4 h-4 animate-pulse" />
                                Active
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium font-mono">
                                {formatDurationDetailed(duration)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center rounded-r-2xl">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isActive ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {isActive ? 'ACTIVE' : 'COMPLETED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-[#1679AB] border-t-transparent rounded-full"></div>
              </div>
            ) : punchRecords.length === 0 ? (
              <div className="bg-[#EEF6FB] rounded-xl p-6 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Records Today</h3>
                <p className="text-gray-500">Punch in to start tracking your attendance</p>
              </div>
            ) : (
              filteredPunchRecords.map((record, idx) => {
                const isActive = !record.punchOut;
                const duration = isActive ? 
                  Math.floor((new Date() - new Date(record.punchIn)) / 1000) :
                  Math.floor((new Date(record.punchOut) - new Date(record.punchIn)) / 1000);

                return (
                  <div
                    key={record._id || idx}
                    className="bg-[#EEF6FB] p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-[#D1E8FF] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <span className="text-sm font-bold">{idx + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#0a2540]">Session {idx + 1}</p>
                          <p className={`text-xs ${
                            isActive ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {isActive ? 'Active' : 'Completed'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <LogIn className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-gray-600">Punch In</p>
                        </div>
                        <p className="font-semibold text-gray-900 font-mono">
                          {formatTime(record.punchIn)}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <LogOut className="w-4 h-4 text-gray-500" />
                          <p className="text-xs text-gray-600">Punch Out</p>
                        </div>
                        <p className="font-semibold text-gray-900 font-mono">
                          {record.punchOut ? formatTime(record.punchOut) : "Active"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-600">Duration</p>
                      </div>
                      <p className="font-semibold text-gray-900 font-mono">
                        {formatDurationDetailed(duration)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer - MonthlySummary Style */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <div className="text-gray-500">
                Showing{" "}
                <span className="font-semibold text-[#0a2540]">
                  {filteredPunchRecords.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {punchRecords.length}
                </span>{" "}
                punch records
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
      </div>
    </div>
  );
}

export default DailyAttendance;