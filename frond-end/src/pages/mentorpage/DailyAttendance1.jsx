import { useState, useEffect, useCallback } from "react";
import Sidebar from "./sidebar";
import axios from "axios";
import { io } from "socket.io-client";

function DailyAttendance1() {
  // -------------------- STATE --------------------
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveTime, setLiveTime] = useState(Date.now());
  const [mentorCourse, setMentorCourse] = useState(""); // NEW: Store mentor's course

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // -------------------- FETCH MENTOR INFO --------------------
  const fetchMentorInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Decode JWT to get mentor ID
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const mentorId = decoded.id;

      // Fetch mentor details to get their course
      const res = await axios.get(
        `http://localhost:3001/mentor/profile/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const course = res.data?.course || res.data?.data?.course;
      setMentorCourse(course);
      console.log(`👨‍🏫 Mentor's course: ${course}`);
    } catch (err) {
      console.error("❌ Error fetching mentor info:", err);
    }
  }, []);

  // -------------------- FETCH ATTENDANCE --------------------
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");

      const res = await axios.get(
        "http://localhost:3001/mentor/today-attendance",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const rawAttendance = res.data?.data || [];

      let dataArray = [];
      if (Array.isArray(rawAttendance)) {
        dataArray = rawAttendance;
      } else if (rawAttendance && typeof rawAttendance === "object") {
        dataArray = [rawAttendance];
      }

      console.log("✅ Fetched attendance:", dataArray);
      
      // FILTER BY MENTOR'S COURSE AUTOMATICALLY
      const filteredByCourse = dataArray.filter((student) => {
        const studentCourse = student?.studentId?.course || student?.course || "";
        return !mentorCourse || studentCourse === mentorCourse;
      });

      console.log(`📊 Showing ${filteredByCourse.length} students from course: ${mentorCourse}`);
      setAttendanceData(filteredByCourse);
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
  }, [mentorCourse]);

  // -------------------- INITIAL LOAD --------------------
  useEffect(() => {
    fetchMentorInfo();
  }, [fetchMentorInfo]);

  useEffect(() => {
    if (mentorCourse) {
      fetchAttendance();
      const interval = setInterval(fetchAttendance, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchAttendance, mentorCourse]);

  // -------------------- LIVE CLOCK --------------------
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // -------------------- SOCKET.IO --------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    const socket = io("http://localhost:3001", {
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
      .padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
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
      const studentBatch = student?.studentId?.batch || student?.batch || "";
      
      const nameMatch = studentName.toLowerCase().includes(search.toLowerCase());
      const batchMatch = batch === "All" || studentBatch === batch;
      const statusMatch =
        status === "All" ||
        getStudentStatus(student?.attendance || student) === status;

      return nameMatch && batchMatch && statusMatch;
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

  const uniqueBatches = [
    "All",
    ...new Set(
      attendanceData
        .map((s) => s?.studentId?.batch || s?.batch)
        .filter(Boolean)
    ),
  ];

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <Sidebar />

      <div className="lg:ml-52 p-6 max-w-7xl mx-auto">
        {/* Header with Course Info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0a2540] mb-1">
              Daily Attendance
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(selectedDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {mentorCourse && (
              <p className="text-sm font-medium text-blue-600 mt-1">
                📚 Course: {mentorCourse}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-4 py-2 rounded-lg"
            />
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="bg-[#0077b6] text-white px-6 py-2 rounded-lg hover:bg-[#005f8f] disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-3xl font-bold">{attendanceData.length}</p>
            {mentorCourse && (
              <p className="text-xs text-gray-500 mt-1">in {mentorCourse}</p>
            )}
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-3xl font-bold text-green-600">
              {
                attendanceData.filter((s) =>
                  ["Present", "Working"].includes(getStudentStatus(s?.attendance || s))
                ).length
              }
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-600">Working Now</p>
            <p className="text-3xl font-bold text-blue-600">
              {
                attendanceData.filter(
                  (s) => getStudentStatus(s?.attendance || s) === "Working"
                ).length
              }
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-3xl font-bold text-red-600">
              {
                attendanceData.filter(
                  (s) => getStudentStatus(s?.attendance || s) === "Absent"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Filters - REMOVED COURSE FILTER */}
        <div className="bg-white p-5 rounded-xl shadow mb-8 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-64"
          />
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            {uniqueBatches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="All">All Status</option>
            <option value="Absent">Absent</option>
            <option value="Present">Present</option>
            <option value="Working">Working</option>
            <option value="On Break">On Break</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="name">Sort: Name</option>
            <option value="punchIn">Sort: Punch In</option>
          </select>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-[#0077b6] border-t-transparent rounded-full"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              {attendanceData.length === 0
                ? isToday
                  ? `No students from ${mentorCourse || 'your course'} have marked attendance today yet.`
                  : "No records found for selected date."
                : "No matching records with current filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="bg-[#f0f9ff] text-[#0077b6] font-semibold">
                    <th className="px-6 py-4 text-left rounded-tl-lg">Name</th>
                    <th className="px-6 py-4 text-left">Batch</th>
                    <th className="px-6 py-4 text-left">Punch In</th>
                    <th className="px-6 py-4 text-left">Punch Out</th>
                    <th className="px-6 py-4 text-left">Working Time</th>
                    <th className="px-6 py-4 text-left">Break Time</th>
                    <th className="px-6 py-4 text-left rounded-tr-lg">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((student) => {
                    const attendance = student?.attendance || student;
                    const studentInfo = student?.studentId || student;

                    const status = getStudentStatus(attendance);
                    const lastPunchIn = getLastPunchIn(attendance);
                    const lastPunchOut = getLastPunchOut(attendance);
                    const workingTime = calculateLiveWorkingTime(attendance);
                    const breakTime = calculateLiveBreakTime(attendance);

                    const statusClasses = {
                      Present: "bg-green-100 text-green-800",
                      Working: "bg-blue-100 text-blue-800",
                      "On Break": "bg-orange-100 text-orange-800",
                      Absent: "bg-red-100 text-red-800",
                    };

                    return (
                      <tr
                        key={student._id}
                        className="border-b hover:bg-blue-50/50 transition"
                      >
                        {/* NAME */}
                        <td className="px-6 py-4 font-medium" scope="row">
                          {studentInfo?.name || "—"}
                        </td>

                        {/* BATCH */}
                        <td className="px-6 py-4">{studentInfo?.batch || "—"}</td>

                        {/* PUNCH IN */}
                        <td className="px-6 py-4 text-green-700">
                          {formatTime(lastPunchIn)}
                        </td>

                        {/* PUNCH OUT */}
                        <td className="px-6 py-4 text-blue-700">
                          {formatTime(lastPunchOut)}
                        </td>

                        {/* WORKING TIME */}
                        <td className="px-6 py-4 font-mono">
                          {formatTimeFromSeconds(workingTime)}
                          {status === "Working" && (
                            <span className="ml-2 animate-pulse text-blue-500">
                              ●
                            </span>
                          )}
                        </td>

                        {/* BREAK TIME */}
                        <td className="px-6 py-4 font-mono">
                          {formatTimeFromSeconds(breakTime)}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              statusClasses[status] || statusClasses["Absent"]
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Live updates • Last refresh:{" "}
          {new Date(liveTime).toLocaleTimeString("en-IN")}
        </div>
      </div>
    </div>
  );
}

export default DailyAttendance1;