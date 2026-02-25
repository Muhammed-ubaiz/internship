import { useState, useEffect, useCallback } from "react";
import Sidebar from "./sidebar";
import api from "../../utils/axiosConfig";
import { io } from "socket.io-client";
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  RefreshCw,
  Filter,
  GraduationCap,
  CheckCircle,
  Briefcase,
  Coffee,
  User,
  Clock,
} from "lucide-react";

function DailyAttendance1() {
  // -------------------- STATE --------------------
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveTime, setLiveTime] = useState(Date.now());
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [batch, setBatch] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // -------------------- FETCH ATTENDANCE --------------------
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);

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
    const socketUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/api$/, "");

    const socket = io(socketUrl, {
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

  const getLastRecord = (attendance) => {
    if (!attendance?.punchRecords?.length) return {};
    return attendance.punchRecords[attendance.punchRecords.length - 1];
  };

  const getStudentStatus = (attendance) => {
    if (!attendance || !attendance.punchRecords || attendance.punchRecords.length === 0) {
      return "Absent";
    }
    const last = getLastRecord(attendance);
    if (last?.punchIn && !last?.punchOut) return "Working";
    if (attendance?.currentBreakStart) return "On Break";
    if (last?.punchIn && last?.punchOut) return "Present";
    return "Absent";
  };

  const calculateWorkingSeconds = (attendance) => {
    if (!attendance) return 0;
    let total = attendance.totalWorkingSeconds || 0;
    const last = getLastRecord(attendance);
    if (last?.punchIn && !last?.punchOut) {
      total += Math.floor((liveTime - new Date(last.punchIn).getTime()) / 1000);
    }
    return Math.max(0, total);
  };

  const formatHours = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getFirstPunchIn = (attendance) => {
    if (!attendance?.punchRecords?.length) return null;
    return attendance.punchRecords[0]?.punchIn || null;
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
        const tA = new Date(getFirstPunchIn(attA) || 0).getTime();
        const tB = new Date(getFirstPunchIn(attB) || 0).getTime();
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

  // -------------------- STATS --------------------
  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter((s) =>
      ["Present", "Working"].includes(getStudentStatus(s?.attendance || s))
    ).length,
    working: attendanceData.filter(
      (s) => getStudentStatus(s?.attendance || s) === "Working"
    ).length,
    absent: attendanceData.filter(
      (s) => getStudentStatus(s?.attendance || s) === "Absent"
    ).length,
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setCourse("All");
    setBatch("All");
    setStatus("All");
  };

  // -------------------- UI --------------------
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
              Daily Attendance
            </h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#0a2540]">
              Daily Attendance
            </h2>
          </div>

          {/* Mobile Date Display */}
          <div className="lg:hidden mb-3 text-center bg-white/50 p-2 rounded-lg">
            <p className="text-sm text-gray-600">
              {new Date(selectedDate).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Date Picker and Refresh - Desktop */}
          <div className="hidden lg:flex flex-col sm:flex-row items-center justify-end gap-4 mb-6">
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0a2540]/40 focus:border-[#0a2540] outline-none transition-all"
            />
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Date Picker and Refresh - Mobile */}
          <div className="lg:hidden flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3 mb-6">
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0a2540]/40 focus:border-[#0a2540] outline-none transition-all text-sm"
            />
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

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
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700">Present</h3>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{stats.present}</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 border hover:scale-105 transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700">Working Now</h3>
                  <Clock3 className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{stats.working}</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 border hover:scale-105 transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-700">Absent</h3>
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{stats.absent}</p>
              </div>
            </div>
          )}

          {/* MAIN CONTENT */}
          {loading && attendanceData.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a2540] border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading attendance data...</p>
              </div>
            </div>
          ) : filteredData.length === 0 && attendanceData.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border p-8 sm:p-12 text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-[#0a2540]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                No Attendance Records
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                No attendance data available for today.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
              {/* Search & Filter */}
              <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:gap-4 items-stretch lg:items-center px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sticky top-0 backdrop-blur-sm z-10 bg-white border-b border-gray-100">
                <div className="group relative w-full lg:w-72">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
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
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
                    >
                      <option value="All">All Status</option>
                      <option value="Present">Present</option>
                      <option value="Working">Working</option>
                      <option value="On Break">On Break</option>
                      <option value="Absent">Absent</option>
                    </select>
                    <Filter className="absolute right-4 w-4 h-4 text-[#0a2540] pointer-events-none" />
                  </div>
                </div>

                <div className="relative w-full lg:w-48 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
                    >
                      {uniqueCourses.map((c, index) => (
                        <option key={index} value={c}>
                          {c === "All" ? "All Courses" : c}
                        </option>
                      ))}
                    </select>
                    <GraduationCap className="absolute right-4 w-4 h-4 text-[#0a2540] pointer-events-none" />
                  </div>
                </div>

                <div className="relative w-full lg:w-48 group">
                  <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#0a2540]/40 active:scale-[0.98] border border-gray-200">
                    <select
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none"
                    >
                      {uniqueBatches.map((b, index) => (
                        <option key={index} value={b}>
                          {b === "All" ? "All Batches" : b}
                        </option>
                      ))}
                    </select>
                    <Users className="absolute right-4 w-4 h-4 text-[#0a2540] pointer-events-none" />
                  </div>
                </div>

                {(search || status !== "All" || batch !== "All" || course !== "All") && (
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
                          <th className="p-3 text-center">Course</th>
                          <th className="p-3 text-center">Batch</th>
                          <th className="p-3 text-center">Check In</th>
                          <th className="p-3 text-center">Check Out</th>
                          <th className="p-3 text-center">Hours Worked</th>
                          <th className="p-3 text-center">Status</th>
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
                          filteredData.map((student, index) => {
                            const attendance = student?.attendance || student;
                            const studentStatus = getStudentStatus(attendance);
                            const workingSeconds = calculateWorkingSeconds(attendance);

                            return (
                              <tr
                                key={index}
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
                                  {student?.studentId?.name || student?.name || "N/A"}
                                </td>

                                <td className="px-4 py-3 text-center break-words">
                                  {student?.studentId?.course || student?.course || "N/A"}
                                </td>

                                <td className="px-4 py-3 text-center break-words">
                                  {student?.studentId?.batch || student?.batch || "N/A"}
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4 text-green-500" />
                                    <span className="font-medium font-mono text-green-700">{formatTime(getFirstPunchIn(attendance))}</span>
                                  </div>
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium font-mono text-blue-700">{formatTime(getLastPunchOut(attendance))}</span>
                                  </div>
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium font-mono">{formatHours(workingSeconds)}</span>
                                  </div>
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${studentStatus === "Present"
                                      ? "bg-green-100 text-green-700"
                                      : studentStatus === "Working"
                                        ? "bg-blue-100 text-blue-700"
                                        : studentStatus === "On Break"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                  >
                                    {studentStatus}
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
              </div>

              {/* Mobile Card View */}
              <div className="block lg:hidden px-4 sm:px-6 lg:px-8 pb-4">
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2 space-y-3">
                  {filteredData.length === 0 ? (
                    <div className="bg-[#EEF6FB] rounded-xl p-6 text-center text-gray-500">
                      No students found
                    </div>
                  ) : (
                    filteredData.map((student, index) => {
                      const attendance = student?.attendance || student;
                      const studentStatus = getStudentStatus(attendance);
                      const workingSeconds = calculateWorkingSeconds(attendance);
                      return (
                        <div
                          key={index}
                          className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transform transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                                    <span className="text-sm font-bold">{index + 1}</span>
                                  </div>
                                  <span className="font-semibold text-[#0a2540]">{student?.studentId?.name || student?.name || "N/A"}</span>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  studentStatus === "Present"
                                    ? "bg-green-100 text-green-700"
                                    : studentStatus === "Working"
                                      ? "bg-blue-100 text-blue-700"
                                      : studentStatus === "On Break"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-red-100 text-red-700"
                                }`}>
                                  {studentStatus}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 mb-3">{student?.studentId?.course || student?.course || "N/A"} | {student?.studentId?.batch || student?.batch || "N/A"}</p>
                              
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="bg-white/60 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600">Check In</p>
                                  <p className="font-semibold text-gray-900 font-mono text-sm">{formatTime(getFirstPunchIn(attendance))}</p>
                                </div>
                                <div className="bg-white/60 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600">Check Out</p>
                                  <p className="font-semibold text-gray-900 font-mono text-sm">{formatTime(getLastPunchOut(attendance))}</p>
                                </div>
                                <div className="bg-white/60 p-2 rounded-lg col-span-2">
                                  <p className="text-xs text-gray-600">Hours</p>
                                  <p className="font-semibold text-gray-900 font-mono text-sm">{formatHours(workingSeconds)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                  <div className="text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-[#0a2540]">
                      {filteredData.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {attendanceData.length}
                    </span>{" "}
                    students
                  </div>

                  {(search || status !== "All" || batch !== "All" || course !== "All") && (
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

export default DailyAttendance1;

