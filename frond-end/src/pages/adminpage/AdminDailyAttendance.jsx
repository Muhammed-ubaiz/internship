import React, { useEffect, useState } from "react";
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
} from "lucide-react";

function AdminDailyAttendance() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [batch, setBatch] = useState("All");
  const [status, setStatus] = useState("All");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL || "https://internshipbackend-p5sn.onrender.com", {
      auth: { token },
      transports: ['websocket']
    });

    socket.on("requestApproved", fetchData);
    socket.on("punchOutApproved", fetchData);

    return () => socket.disconnect();
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/admin/daily-attendance?date=${date}`,
      );
      setRows(res.data.attendanceData || []);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const lastRecord = (a) => a?.punchRecords?.slice(-1)[0];

  const getFirstPunchIn = (a) => {
    if (!a?.punchRecords?.length) return null;
    return a.punchRecords[0]?.punchIn || null;
  };

  const getLastPunchOut = (a) => {
    if (!a?.punchRecords?.length) return null;
    return a.punchRecords[a.punchRecords.length - 1]?.punchOut || null;
  };

  const getStatus = (a) => {
    const r = lastRecord(a);
    if (!r) return "Absent";
    if (r.punchIn && !r.punchOut) return "Working";
    return "Present";
  };

  const workingSeconds = (a) => {
    let t = a?.totalWorkingSeconds || 0;
    const r = lastRecord(a);
    if (r?.punchIn && !r?.punchOut) {
      t += Math.floor((now - new Date(r.punchIn)) / 1000);
    }
    return t;
  };

  const fmt = (s) =>
    `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

  const time = (t) =>
    t
      ? new Date(t).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "--";

  const filtered = rows.filter(
    (r) =>
      r.studentName?.toLowerCase().includes(search.toLowerCase()) &&
      (course === "All" || r.course === course) &&
      (batch === "All" || r.batch === batch) &&
      (status === "All" || getStatus(r.attendance) === status)
  );

  const courses = ["All", ...new Set(rows.map((r) => r.course).filter(Boolean))];
  const batches = ["All", ...new Set(rows.map((r) => r.batch).filter(Boolean))];

  const stats = {
    total: rows.length,
    present: rows.filter((r) =>
      ["Present", "Working"].includes(getStatus(r.attendance))
    ).length,
    working: rows.filter(
      (r) => getStatus(r.attendance) === "Working"
    ).length,
    absent: rows.filter(
      (r) => getStatus(r.attendance) === "Absent"
    ).length,
  };

  const clearAllFilters = () => {
    setSearch("");
    setCourse("All");
    setBatch("All");
    setStatus("All");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 pt-14 lg:pt-4">
      <Sidebar />

      <div className="ml-0 md:ml-52 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#0a2540] font-[Montserrat] mb-2">
            Daily Attendance
          </h1>
          <p className="text-gray-600">
            Track attendance for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4">
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0a2540]/40 focus:border-[#0a2540] outline-none transition-all"
          />
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-[#0a2540] text-white rounded-lg hover:bg-[#0a2540]/90 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0a2540] border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attendance data...</p>
            </div>
          </div>
        ) : filtered.length === 0 && rows.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-[#0a2540]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Attendance Records
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              No attendance data available for the selected date.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Search & Filter - visible on all screens */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center p-5 sticky top-0 backdrop-blur-sm py-4 z-10 rounded-xl bg-white border-b border-gray-100">
              <div className="group relative w-full sm:w-72">
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
                    {courses.map((c, index) => (
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
                    {batches.map((b, index) => (
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
                  {filtered.length === 0 ? (
                    <tr className="bg-[#EEF6FB] hover:bg-[#D1E8FF]">
                      <td colSpan="8" className="text-center p-4 rounded-2xl">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, index) => (
                      <tr
                        key={index}
                        className="bg-[#EEF6FB] hover:bg-[#D1E8FF] transition-all duration-300 hover:scale-[0.99]"
                      >
                        <td className="px-3 py-3 text-center">{index + 1}</td>

                        <td className="px-4 py-3 text-center font-medium break-words">
                          {r.studentName}
                        </td>

                        <td className="px-4 py-3 text-center break-words">
                          {r.course || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-center break-words">
                          {r.batch || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-center text-green-700 font-medium">
                          {time(getFirstPunchIn(r.attendance))}
                        </td>

                        <td className="px-4 py-3 text-center text-blue-700 font-medium">
                          {time(getLastPunchOut(r.attendance))}
                        </td>

                        <td className="px-4 py-3 text-center font-mono font-medium">
                          {fmt(workingSeconds(r.attendance))}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatus(r.attendance) === "Present"
                              ? "bg-green-100 text-green-700"
                              : getStatus(r.attendance) === "Working"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                              }`}
                          >
                            {getStatus(r.attendance)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="bg-[#EEF6FB] rounded-xl p-6 text-center text-gray-500">
                  No students found
                </div>
              ) : (
                filtered.map((r, index) => (
                  <div
                    key={index}
                    className="bg-[#EEF6FB] p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-[#D1E8FF] transition-all duration-300"
                  >
                    <p className="font-semibold text-[#0a2540] mb-1">{r.studentName}</p>
                    <p className="text-xs text-gray-500 mb-3">{r.course || "N/A"} | {r.batch || "N/A"}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Check In</p>
                        <p className="font-medium text-green-700">{time(getFirstPunchIn(r.attendance))}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Check Out</p>
                        <p className="font-medium text-blue-700">{time(getLastPunchOut(r.attendance))}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg">
                        <p className="text-xs text-gray-600">Hours</p>
                        <p className="font-mono font-medium">{fmt(workingSeconds(r.attendance))}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg flex items-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatus(r.attendance) === "Present"
                            ? "bg-green-100 text-green-700"
                            : getStatus(r.attendance) === "Working"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {getStatus(r.attendance)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-[#0a2540]">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {rows.length}
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

export default AdminDailyAttendance;