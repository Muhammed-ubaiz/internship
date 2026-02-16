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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 pt-14 lg:pt-4">
      <Sidebar />

      <div className="ml-0 md:ml-52 p-4 md:p-6 max-w-7xl mx-auto">
        {/* HEADER - centered on mobile */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#0a2540] font-[Montserrat] mb-2">
            Daily Attendance
          </h1>
          <p className="text-gray-600">
            Track attendance for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4">
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

        {/* STATS CARDS - Exact Admin Style */}
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
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Working Now</p>
                <p className="text-2xl font-bold text-blue-600">{stats.working}</p>
              </div>
              <Clock3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a2540] border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attendance data...</p>
            </div>
          </div>
        ) : filteredData.length === 0 && attendanceData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[#0a2540]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Attendance Records
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              No attendance data available for today.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Search & Filter - visible on all screens */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center p-5 sticky top-0 backdrop-blur-sm py-4 z-10 rounded-xl bg-white border-b border-gray-100">
              <div className="group relative w-full sm:w-72">
                <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-[#0a2540]/40">
                  <input
                    type="text"
                    placeholder="Search by name..."
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
                  <Filter className="absolute right-4 w-4 h-4 text-[#0a2540]" />
                </div>
              </div>

              <div className="relative w-full sm:w-48 group">
                <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-[#0a2540]/40">
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
                  <GraduationCap className="absolute right-4 w-4 h-4 text-[#0a2540]" />
                </div>
              </div>

              <div className="relative w-full sm:w-48 group">
                <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-[#0a2540]/40">
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
                  <Users className="absolute right-4 w-4 h-4 text-[#0a2540]" />
                </div>
              </div>

              {(search || status !== "All" || batch !== "All" || course !== "All") && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#0a2540] transition-colors hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto max-h-[470px] overflow-y-auto">
              <table className="w-full text-sm border-separate border-spacing-y-3 p-3">
                <thead className="bg-white">
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
                      const lastRecord = getLastRecord(attendance);
                      const workingSeconds = calculateWorkingSeconds(attendance);

                      return (
                        <tr
                          key={index}
                          className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition-all duration-300 hover:scale-[0.99]"
                        >
                          <td className="px-3 py-3 text-center">{index + 1}</td>

                          <td className="px-4 py-3 text-center font-medium break-words">
                            {student?.studentId?.name || student?.name || "N/A"}
                          </td>

                          <td className="px-4 py-3 text-center break-words">
                            {student?.studentId?.course || student?.course || "N/A"}
                          </td>

                          <td className="px-4 py-3 text-center break-words">
                            {student?.studentId?.batch || student?.batch || "N/A"}
                          </td>

                          <td className="px-4 py-3 text-center text-green-700 font-medium">
                            {formatTime(getFirstPunchIn(attendance))}
                          </td>

                          <td className="px-4 py-3 text-center text-blue-700 font-medium">
                            {formatTime(getLastPunchOut(attendance))}
                          </td>

                          <td className="px-4 py-3 text-center font-mono font-medium">
                            {formatHours(workingSeconds)}
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

            {/* Mobile Card View */}
            <div className="block lg:hidden p-4 space-y-3">
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
                      className="bg-[#EEF6FB] p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-[#D1E8FF] transition-all duration-300"
                    >
                      <p className="font-semibold text-[#0a2540] mb-1">{student?.studentId?.name || student?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500 mb-3">{student?.studentId?.course || student?.course || "N/A"} | {student?.studentId?.batch || student?.batch || "N/A"}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-600">Check In</p>
                          <p className="font-medium text-green-700">{formatTime(getFirstPunchIn(attendance))}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-600">Check Out</p>
                          <p className="font-medium text-blue-700">{formatTime(getLastPunchOut(attendance))}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <p className="text-xs text-gray-600">Hours</p>
                          <p className="font-mono font-medium">{formatHours(workingSeconds)}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg flex items-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${studentStatus === "Present"
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
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer - Exact Admin Style */}
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
  );
}

export default DailyAttendance1;

