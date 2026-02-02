import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import axios from "axios";
import { io } from "socket.io-client";

function AdminDailyAttendance() {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [batch, setBatch] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [socket, setSocket] = useState(null);
  const [liveTime, setLiveTime] = useState(Date.now());

  // Live clock for real-time working time
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io("http://localhost:3001", {
      auth: { token },
      transports: ["polling", "websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Admin socket connected");
    });

    newSocket.on("requestApproved", (approvalData) => {
      console.log("🔔 Student punched in:", approvalData);
      if (selectedDate === new Date().toISOString().split("T")[0]) {
        fetchDailyAttendance();
      }
    });

    newSocket.on("punchOutApproved", (punchOutData) => {
      console.log("🔔 Student punched out:", punchOutData);
      if (selectedDate === new Date().toISOString().split("T")[0]) {
        fetchDailyAttendance();
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyAttendance();
  }, [selectedDate]);

  const fetchDailyAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token → not logged in?");
        setLoading(false);
        return;
      }

      if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        console.warn("Invalid selectedDate:", selectedDate);
        setLoading(false);
        return;
      }

      const url = `http://localhost:3001/admin/daily-attendance?date=${selectedDate}`;
      console.log("Fetching from:", url);

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        console.log("✅ Received data:", res.data.attendanceData);
        setData(res.data.attendanceData || []);
      } else {
        console.warn("Backend error message:", res.data.message);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Backend response:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateLiveWorkingTime = (attendance) => {
    if (!attendance) return 0;
    
    let total = attendance.totalWorkingSeconds || 0;
    
    // If currently working, add live time
    const lastRecord = attendance.punchRecords?.[attendance.punchRecords.length - 1];
    if (lastRecord?.punchIn && !lastRecord?.punchOut) {
      const punchInTime = new Date(lastRecord.punchIn).getTime();
      const elapsedSeconds = Math.floor((liveTime - punchInTime) / 1000);
      total += elapsedSeconds;
    }
    
    return Math.max(0, total);
  };

  const formatWorkingTime = (seconds) => {
    if (!seconds || seconds === 0) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatus = (attendance) => {
    if (!attendance || !attendance.punchRecords || attendance.punchRecords.length === 0) {
      return "Absent";
    }
    const lastRecord = attendance.punchRecords[attendance.punchRecords.length - 1];
    if (lastRecord.punchIn && !lastRecord.punchOut) return "Working";
    if (lastRecord.punchIn && lastRecord.punchOut) return "Present";
    return "Absent";
  };

  const getLastPunchIn = (punchRecords) => {
    if (!punchRecords?.length) return "--:--";
    const time = punchRecords[punchRecords.length - 1].punchIn;
    return time
      ? new Date(time).toLocaleTimeString("en-IN", { 
          hour: "2-digit", 
          minute: "2-digit", 
          hour12: true 
        })
      : "--:--";
  };

  const getLastPunchOut = (punchRecords) => {
    if (!punchRecords?.length) return "--:--";
    const time = punchRecords[punchRecords.length - 1].punchOut;
    return time
      ? new Date(time).toLocaleTimeString("en-IN", { 
          hour: "2-digit", 
          minute: "2-digit", 
          hour12: true 
        })
      : "--:--";
  };

  const filteredData = data
    .filter(
      (i) =>
        i.studentName?.toLowerCase().includes(search.toLowerCase()) &&
        (course === "All" || i.course === course) &&
        (batch === "All" || i.batch === batch) &&
        (status === "All" || getStatus(i.attendance) === status)
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.studentName.localeCompare(b.studentName);
      if (sortBy === "punchIn") {
        const ta = getLastPunchIn(a.attendance?.punchRecords) || "00:00";
        const tb = getLastPunchIn(b.attendance?.punchRecords) || "00:00";
        return ta.localeCompare(tb);
      }
      return 0;
    });

  const courses = ["All", ...new Set(data.map(i => i.course).filter(Boolean))];
  const batches = ["All", ...new Set(data.map(i => i.batch).filter(Boolean))];

  const totalStudents = data.length;
  const presentCount = data.filter(d => ["Present", "Working"].includes(getStatus(d.attendance))).length;
  const absentCount = data.filter(d => getStatus(d.attendance) === "Absent").length;
  const workingCount = data.filter(d => getStatus(d.attendance) === "Working").length;

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-2 sm:p-4 lg:p-6">
      <Sidebar />

      <div className="lg:ml-52 p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sticky top-0 bg-[#EEF6FB] py-2 z-10">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#141E46] font-[Montserrat]">
            Daily Attendance
          </h1>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-700">{totalStudents}</div>
            <div className="text-sm text-gray-600 mt-1">Total Students</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
            <div className="text-2xl font-bold text-green-700">{presentCount}</div>
            <div className="text-sm text-gray-600 mt-1">Present/Working</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-100">
            <div className="text-2xl font-bold text-yellow-700">{workingCount}</div>
            <div className="text-sm text-gray-600 mt-1">Currently Working</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
            <div className="text-2xl font-bold text-red-700">{absentCount}</div>
            <div className="text-sm text-gray-600 mt-1">Absent</div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl p-3 sm:p-5 max-h-[640px] overflow-y-auto">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center mb-4 sticky top-0 bg-white py-4 z-10">
            {/* Search */}
            <div className="group relative w-full sm:w-80">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-4 sm:px-5 py-2 sm:py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                />
                <button className="relative flex items-center justify-center w-8 h-8 m-1 rounded-full bg-[#141E46] transition-all duration-300 ease-out group-hover:scale-105 hover:scale-110 active:scale-95">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Course Filter */}
            <div className="relative w-full sm:w-52 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#141E46]"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All Courses" : c}
                    </option>
                  ))}
                </select>
                <span className="absolute right-5 text-[#141E46] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180 group-active:scale-90">
                  ▼
                </span>
              </div>
            </div>

            {/* Batch Filter */}
            <div className="relative w-full sm:w-52 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#141E46]"
                >
                  {batches.map((b) => (
                    <option key={b} value={b}>
                      {b === "All" ? "All Batches" : b}
                    </option>
                  ))}
                </select>
                <span className="absolute right-5 text-[#141E46] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180 group-active:scale-90">
                  ▼
                </span>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-52 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#141E46]"
                >
                  <option value="All">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Working">Working</option>
                  <option value="Absent">Absent</option>
                </select>
                <span className="absolute right-5 text-[#141E46] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180 group-active:scale-90">
                  ▼
                </span>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="relative w-full sm:w-52 group">
              <div className="flex items-center bg-white rounded-full shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-[1px] focus-within:shadow-2xl focus-within:-translate-y-[2px] focus-within:ring-2 focus-within:ring-[#141E46]/40 active:scale-[0.98]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full bg-transparent px-4 sm:px-5 py-2 sm:py-3 pr-12 text-sm text-gray-700 rounded-full cursor-pointer outline-none transition-all duration-300 focus:text-[#141E46]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="punchIn">Sort by Punch In</option>
                </select>
                <span className="absolute right-5 text-[#141E46] transition-all duration-300 group-hover:rotate-180 group-focus-within:rotate-180 group-active:scale-90">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#141E46] border-t-transparent"></div>
              <p className="mt-5 text-gray-600 font-medium">Loading attendance...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-[#EEF6FB] p-4 rounded-xl text-center">
              <div className="text-gray-400 text-7xl mb-4">📋</div>
              <p className="text-xl font-medium text-gray-700">No attendance records found</p>
              <p className="text-gray-500 mt-3">Try changing filters or select different date</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3">
                {filteredData.map((item, i) => {
                  const workingSeconds = calculateLiveWorkingTime(item.attendance);
                  const currentStatus = getStatus(item.attendance);
                  
                  return (
                    <div
                      key={i}
                      className="bg-[#EEF6FB] hover:bg-[#D1E8FF] p-4 rounded-xl transform transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#141E46] mb-1">{item.studentName}</h3>
                          <p className="text-sm text-gray-600">{item.course || "—"} | {item.batch || "—"}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            currentStatus === "Present"
                              ? "bg-green-100 text-green-700"
                              : currentStatus === "Working"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">In:</span> {getLastPunchIn(item.attendance?.punchRecords)}
                        </div>
                        <div>
                          <span className="font-medium">Out:</span> {getLastPunchOut(item.attendance?.punchRecords)}
                        </div>
                        <div>
                          <span className="font-medium">Worked:</span> {formatWorkingTime(workingSeconds)}
                          {currentStatus === "Working" && (
                            <span className="ml-1 animate-pulse text-blue-500">●</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-y-3">
                  <thead className="h-15 sticky top-18 bg-white">
                    <tr className="text-[#1679AB]">
                      <th className="px-2">Name</th>
                      <th className="px-2">Course</th>
                      <th className="px-2">Batch</th>
                      <th className="px-2">Punch In</th>
                      <th className="px-2">Punch Out</th>
                      <th className="px-2">Worked Time</th>
                      <th className="px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, i) => {
                      const workingSeconds = calculateLiveWorkingTime(item.attendance);
                      const currentStatus = getStatus(item.attendance);
                      
                      return (
                        <tr
                          key={i}
                          className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transform transition-all duration-300 hover:scale-98"
                        >
                          <td className="px-4 py-3 text-center font-medium">{item.studentName}</td>
                          <td className="px-4 py-3 text-center">{item.course || "—"}</td>
                          <td className="px-4 py-3 text-center">{item.batch || "—"}</td>
                          <td className="px-4 py-3 text-center text-green-700">{getLastPunchIn(item.attendance?.punchRecords)}</td>
                          <td className="px-4 py-3 text-center text-blue-700">{getLastPunchOut(item.attendance?.punchRecords)}</td>
                          <td className="px-4 py-3 text-center font-mono">
                            {formatWorkingTime(workingSeconds)}
                            {currentStatus === "Working" && (
                              <span className="ml-2 animate-pulse text-blue-500">●</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                currentStatus === "Present"
                                  ? "bg-green-100 text-green-700"
                                  : currentStatus === "Working"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {currentStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Live updates • Last refresh: {new Date(liveTime).toLocaleTimeString("en-IN")}
        </div>
      </div>
    </div>
  );
}

export default AdminDailyAttendance;