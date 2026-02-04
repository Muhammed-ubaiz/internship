import { useState, useEffect, useCallback } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";
import { io } from "socket.io-client";
import {
  Clock,
  User,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  X,
  RefreshCw,
  BookOpen,
  Users,
  Briefcase,
  Coffee,
  Home,
} from "lucide-react";

function DailyAttendance1() {
  // -------------------- STATE --------------------
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveTime, setLiveTime] = useState(Date.now());

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [batch, setBatch] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // -------------------- FETCH ATTENDANCE --------------------
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Backend now filters by mentor's course automatically
      const res = await api.get("/mentor/today-attendance");

      const rawAttendance = res.data?.data || [];

      let dataArray = [];
      if (Array.isArray(rawAttendance)) {
        dataArray = rawAttendance;
      } else if (rawAttendance && typeof rawAttendance === "object") {
        dataArray = [rawAttendance];
      }

      console.log("✅ Fetched attendance (filtered by mentor's course):", dataArray.length);
      setAttendanceData(dataArray);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load attendance"
      );
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------- AUTO FETCH --------------------
  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 30000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  // -------------------- LIVE CLOCK --------------------
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // -------------------- SOCKET.IO --------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

    const socket = io(API_BASE, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 Mentor socket connected:", socket.id);
    });

    socket.on("attendance-updated", () => {
      console.log("🔄 Attendance updated (socket)");
      fetchAttendance();
    });

    socket.on("disconnect", () => {
      console.log("🔴 Mentor socket disconnected");
    });

    return () => socket.disconnect();
  }, [fetchAttendance]);

  // -------------------- HELPERS --------------------
  const formatTime = (time) => {
    if (!time) return "--:--";
    const d = new Date(time);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeFromSeconds = (sec = 0) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}h ${m
      .toString()
      .padStart(2, "0")}m`;
  };

  const getStudentStatus = (attendance) => {
    if (!attendance || !attendance.punchRecords || attendance.punchRecords.length === 0) {
      return "Absent";
    }
    const last = attendance.punchRecords[attendance.punchRecords.length - 1];
    if (last?.punchIn && !last?.punchOut) return "Working";
    if (attendance?.currentBreakStart) return "On Break";
    if (last?.punchIn && last?.punchOut) return "Present";
    return "Absent";
  };

  const calculateLiveWorkingTime = (attendance) => {
    if (!attendance) return 0;
    let total = attendance.totalWorkingSeconds || 0;
    const last = attendance.punchRecords?.[attendance.punchRecords.length - 1];
    if (last?.punchIn && !last?.punchOut) {
      total += Math.floor(
        (liveTime - new Date(last.punchIn).getTime()) / 1000
      );
    }
    return Math.max(0, total);
  };

  const calculateLiveBreakTime = (attendance) => {
    if (!attendance) return 0;
    let total = attendance.totalBreakSeconds || 0;
    if (attendance.currentBreakStart) {
      total += Math.floor(
        (liveTime - new Date(attendance.currentBreakStart).getTime()) / 1000
      );
    }
    return Math.max(0, total);
  };

  const getLastPunchIn = (attendance) => {
    if (!attendance?.punchRecords?.length) return null;
    return attendance.punchRecords[attendance.punchRecords.length - 1]?.punchIn || null;
  };

  const getLastPunchOut = (attendance) => {
    if (!attendance?.punchRecords?.length) return null;
    return attendance.punchRecords[attendance.punchRecords.length - 1]?.punchOut || null;
  };

  // -------------------- FILTER + SORT --------------------
  const filteredData = attendanceData
    .filter((student) => {
      const studentName = student?.studentId?.name || student?.name || "";
      const studentCourse = student?.studentId?.course || student?.course || "";
      const studentBatch = student?.studentId?.batch || student?.batch || "";
      
      const nameMatch = studentName.toLowerCase().includes(search.toLowerCase());
      const courseMatch = course === "All" || studentCourse === course;
      const batchMatch = batch === "All" || studentBatch === batch;
      const statusMatch =
        status === "All" ||
        getStudentStatus(student?.attendance || student) === status;

      return nameMatch && courseMatch && batchMatch && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a?.studentId?.name || a?.name || "";
        const nameB = b?.studentId?.name || b?.name || "";
        return nameA.localeCompare(nameB);
      }
      if (sortBy === "punchIn") {
        const attA = a?.attendance || a;
        const attB = b?.attendance || b;
        const tA = new Date(getLastPunchIn(attA) || 0).getTime();
        const tB = new Date(getLastPunchIn(attB) || 0).getTime();
        return tA - tB;
      }
      return 0;
    });

  const uniqueCourses = [
    "All",
    ...new Set(
      attendanceData
        .map((s) => s?.studentId?.course || s?.course)
        .filter(Boolean)
    ),
  ];
  const uniqueBatches = [
    "All",
    ...new Set(
      attendanceData
        .map((s) => s?.studentId?.batch || s?.batch)
        .filter(Boolean)
    ),
  ];

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  // -------------------- STATUS ICONS --------------------
  const getStatusIcon = (status) => {
    switch (status) {
      case "Working":
        return <Briefcase className="w-4 h-4" />;
      case "Present":
        return <CheckCircle className="w-4 h-4" />;
      case "On Break":
        return <Coffee className="w-4 h-4" />;
      case "Absent":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Working":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Present":
        return "bg-green-50 text-green-700 border-green-200";
      case "On Break":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Absent":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setCourse("All");
    setBatch("All");
    setStatus("All");
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
                Daily Attendance
              </h1>
              <p className="text-gray-600">
                {new Date(selectedDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border px-4 py-2 rounded-lg"
              />
              <button
                onClick={fetchAttendance}
                disabled={loading}
                className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            <strong>Error:</strong> {error}
            <button onClick={fetchAttendance} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold">{attendanceData.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-green-600">
              {
                attendanceData.filter((s) =>
                  ["Present", "Working"].includes(getStudentStatus(s?.attendance || s))
                ).length
              }
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-600">Working Now</p>
            <p className="text-2xl font-bold text-blue-600">
              {
                attendanceData.filter(
                  (s) => getStudentStatus(s?.attendance || s) === "Working"
                ).length
              }
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">
              {
                attendanceData.filter(
                  (s) => getStudentStatus(s?.attendance || s) === "Absent"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center mb-6 sticky top-0 backdrop-blur-sm py-4 z-10 rounded-xl">
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

          {/* Course Filter */}
          <div className="relative w-full sm:w-48 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
              >
                {uniqueCourses.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Courses" : c}
                  </option>
                ))}
              </select>
              <BookOpen className="absolute right-4 w-4 h-4 text-[#0a2540]" />
            </div>
          </div>

          {/* Batch Filter */}
          <div className="relative w-full sm:w-48 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
              >
                {uniqueBatches.map((b) => (
                  <option key={b} value={b}>
                    {b === "All" ? "All Batches" : b}
                  </option>
                ))}
              </select>
              <Users className="absolute right-4 w-4 h-4 text-[#0a2540]" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-48 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
              >
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Working">Working</option>
                <option value="On Break">On Break</option>
                <option value="Absent">Absent</option>
              </select>
              <Filter className="absolute right-4 w-4 h-4 text-[#0a2540]" />
            </div>
          </div>

          {/* Sort By */}
          <div className="relative w-full sm:w-48 group">
            <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#0a2540]"
              >
                <option value="name">Sort: Name</option>
                <option value="punchIn">Sort: Punch In Time</option>
              </select>
              <Clock className="absolute right-4 w-4 h-4 text-[#0a2540]" />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(search || course !== "All" || batch !== "All" || status !== "All") && (
            <button
              onClick={clearAllFilters}
              className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Clear All
            </button>
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a2540] border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attendance data...</p>
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
              onClick={fetchAttendance}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[#0a2540]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {attendanceData.length === 0
                ? isToday
                  ? "No Attendance Today"
                  : "No Records Found"
                : "No Matching Students"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {attendanceData.length === 0
                ? isToday
                  ? "No students have marked attendance yet. Check back later."
                  : "No attendance records found for the selected date."
                : "No students match your current filters. Try adjusting your search criteria."}
            </p>
            {(search || course !== "All" || batch !== "All" || status !== "All") && (
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
            {filteredData.map((student) => {
              const attendance = student?.attendance || student;
              const studentInfo = student?.studentId || student;
              const studentStatus = getStudentStatus(attendance);
              const lastPunchIn = getLastPunchIn(attendance);
              const lastPunchOut = getLastPunchOut(attendance);
              const workingTime = calculateLiveWorkingTime(attendance);
              const breakTime = calculateLiveBreakTime(attendance);

              return (
                <div
                  key={student._id}
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
                            {studentInfo?.name || "Unknown Student"}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-500">
                              {studentInfo?.course || "—"}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {studentInfo?.batch || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          studentStatus
                        )} flex items-center gap-1`}
                      >
                        {getStatusIcon(studentStatus)}
                        {studentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>Punch In</span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {formatTime(lastPunchIn)}
                          {studentStatus === "Working" && (
                            <span className="ml-2 animate-pulse text-blue-500">
                              ●
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>Punch Out</span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {formatTime(lastPunchOut)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Briefcase className="w-4 h-4" />
                          <span>Working Time</span>
                        </div>
                        <p className="font-mono font-medium text-gray-900">
                          {formatTimeFromSeconds(workingTime)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Coffee className="w-4 h-4" />
                          <span>Break Time</span>
                        </div>
                        <p className="font-mono font-medium text-gray-900">
                          {formatTimeFromSeconds(breakTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="text-xs text-gray-500">
                      Last updated: {formatTime(liveTime)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Bar */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <div className="text-gray-500">
                {search || course !== "All" || batch !== "All" || status !== "All" ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-[#0a2540]">
                      {filteredData.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {attendanceData.length}
                    </span>{" "}
                    students
                  </>
                ) : (
                  <>
                    Showing all{" "}
                    <span className="font-semibold">
                      {filteredData.length}
                    </span>{" "}
                    students
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                {(search || course !== "All" || batch !== "All" || status !== "All") && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[#0a2540] hover:underline text-sm flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear Filters
                  </button>
                )}
                <div className="text-xs text-gray-500">
                  Live updates • Last refresh:{" "}
                  {new Date(liveTime).toLocaleTimeString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyAttendance1;