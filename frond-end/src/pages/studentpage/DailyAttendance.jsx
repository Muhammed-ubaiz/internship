import React, { useEffect, useState } from "react";
import axios from "axios";
import SideBarStudent from "./SideBarStudent";

function DailyAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [punchRecords, setPunchRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      const res = await axios.get(
        "http://localhost:3001/student/today-attendance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: role,
          },
        }
      );

      console.log("✅ Attendance response:", res.data);

      const attendanceData = res.data.attendance;

      if (attendanceData) {
        setAttendance(attendanceData);

        // Extract punch records - support both new and old format
        if (attendanceData.punchRecords && Array.isArray(attendanceData.punchRecords)) {
          setPunchRecords(attendanceData.punchRecords);
        } else if (attendanceData.punchInTime) {
          // Legacy format - create single record
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
      } else {
        setAttendance(null);
        setPunchRecords([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("❌ Fetch error:", err);
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
          second: "2-digit",
          hour12: true,
        })
      : "--:--:--";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const calculateSessionDuration = (punchIn, punchOut) => {
    if (!punchIn) return "00:00:00";

    const start = new Date(punchIn);
    const end = punchOut ? new Date(punchOut) : new Date();
    const diffMs = end - start;
    const diffSeconds = Math.floor(diffMs / 1000);

    return formatDuration(diffSeconds);
  };

  return (
    <div className="flex min-h-screen bg-[#eef5f9] p-5">
      {/* Sidebar */}
      <SideBarStudent />

      {/* Main Content */}
      <div className="md:ml-60 w-full pt-14 md:pt-0 px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
       {/* Header */}
<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
  <h2 className="text-xl md:text-2xl font-bold text-[#0a2540] text-center sm:text-left w-full sm:w-auto">
    Today's Attendance Records
  </h2>
  <button
    onClick={fetchAttendance}
    className="w-full sm:w-auto px-4 py-2 bg-[#1679AB] text-white rounded-lg hover:bg-[#0d5a87] transition-colors flex items-center justify-center gap-2"
  >
    🔄 Refresh
  </button>
</div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start sm:items-center gap-2">
              <span className="text-red-600 text-lg flex-shrink-0">⚠️</span>
              <p className="text-red-700 font-medium text-sm md:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {attendance && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
              <p className="text-xs md:text-sm text-[#1679AB] mb-2">📅 Date</p>
              <h3 className="text-lg md:text-xl font-bold text-[#141E46]">
                {formatDate(attendance.date)}
              </h3>
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
              <p className="text-xs md:text-sm text-[#1679AB] mb-2">
                ⏰ Total Working Time
              </p>
              <h3 className="text-lg md:text-xl font-bold text-green-600">
                {formatDuration(attendance.totalWorkingSeconds || 0)}
              </h3>
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
              <p className="text-xs md:text-sm text-[#1679AB] mb-2">
                ☕ Total Break Time
              </p>
              <h3 className="text-lg md:text-xl font-bold text-orange-600">
                {formatDuration(attendance.totalBreakSeconds || 0)}
              </h3>
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
              <p className="text-xs md:text-sm text-[#1679AB] mb-2">📊 Status</p>
              <h3
                className={`text-lg md:text-xl font-bold ${
                  attendance.status === "WORKING"
                    ? "text-yellow-600"
                    : attendance.status === "PRESENT"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {attendance.status}
              </h3>
            </div>
          </div>
        )}

        {/* Punch Records Table */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-[#0a2540] mb-4">
            Punch In/Out Records
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#1679AB] border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4 text-sm md:text-base">
                Loading attendance...
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {punchRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2">📋</span>
                    <p className="text-gray-500 font-medium">No punch records today</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Punch in to start tracking
                    </p>
                  </div>
                ) : (
                  punchRecords.map((record, i) => (
                    <div
                      key={record._id || i}
                      className="bg-[#f1f8fd] rounded-lg p-4 space-y-3"
                    >
                      {/* Session Number */}
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="font-bold text-gray-700">Session #{i + 1}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            !record.punchOut
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {!record.punchOut ? "ACTIVE" : "COMPLETED"}
                        </span>
                      </div>

                      {/* Punch In */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Punch In</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span className="text-green-700 font-semibold text-sm">
                            {formatTime(record.punchIn)}
                          </span>
                        </div>
                      </div>

                      {/* Punch Out */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Punch Out</span>
                        {record.punchOut ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 font-bold">✗</span>
                            <span className="text-red-700 font-semibold text-sm">
                              {formatTime(record.punchOut)}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            <span className="animate-pulse">⏱️</span>
                            Working...
                          </span>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="font-mono font-semibold text-[#0a2540]">
                          {calculateSessionDuration(record.punchIn, record.punchOut)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-[#0077b6] font-semibold">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Punch In Time</th>
                      <th className="px-4 py-3">Punch Out Time</th>
                      <th className="px-4 py-3">Session Duration</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {punchRecords.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl mb-2">📋</span>
                            <p className="text-gray-500 font-medium">
                              No punch records today
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Punch in to start tracking
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      punchRecords.map((record, i) => (
                        <tr
                          key={record._id || i}
                          className="bg-[#f1f8fd] hover:bg-[#e6f3fb] transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-700">
                            {i + 1}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-bold">✓</span>
                              <span className="text-green-700 font-semibold">
                                {formatTime(record.punchIn)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            {record.punchOut ? (
                              <div className="flex items-center gap-2">
                                <span className="text-red-600 font-bold">✗</span>
                                <span className="text-red-700 font-semibold">
                                  {formatTime(record.punchOut)}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                <span className="animate-pulse">⏱️</span>
                                Working...
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-[#0a2540]">
                              {calculateSessionDuration(
                                record.punchIn,
                                record.punchOut
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                !record.punchOut
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {!record.punchOut ? "ACTIVE" : "COMPLETED"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyAttendance;