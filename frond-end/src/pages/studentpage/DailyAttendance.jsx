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
    
      const res = await axios.get(
        "http://localhost:3001/student/today-attendance",
        {
          headers: { Authorization: `Bearer ${token}` },
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
          setPunchRecords([{
            punchIn: attendanceData.punchInTime,
            punchOut: attendanceData.punchOutTime,
            _id: 'legacy-record'
          }]);
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
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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
    <div className="flex min-h-screen bg-[#eef5f9]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <SideBarStudent />
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#0a2540]">
            Today's Attendance Records
          </h2>
          <button
            onClick={fetchAttendance}
            className="px-4 py-2 bg-[#1679AB] text-white rounded-lg hover:bg-[#0d5a87] transition-colors flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 text-lg mr-2">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {attendance && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-sm text-[#1679AB] mb-2">📅 Date</p>
              <h3 className="text-xl font-bold text-[#141E46]">
                {formatDate(attendance.date)}
              </h3>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-sm text-[#1679AB] mb-2">⏰ Total Working Time</p>
              <h3 className="text-xl font-bold text-green-600">
                {formatDuration(attendance.totalWorkingSeconds || 0)}
              </h3>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-sm text-[#1679AB] mb-2">☕ Total Break Time</p>
              <h3 className="text-xl font-bold text-orange-600">
                {formatDuration(attendance.totalBreakSeconds || 0)}
              </h3>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-sm text-[#1679AB] mb-2">📊 Status</p>
              <h3 className={`text-xl font-bold ${
                attendance.status === "WORKING" 
                  ? "text-yellow-600" 
                  : attendance.status === "PRESENT"
                  ? "text-green-600"
                  : "text-red-600"
              }`}>
                {attendance.status}
              </h3>
            </div>
          </div>
        )}

        {/* Punch Records Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-[#0a2540] mb-4">
            Punch In/Out Records
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#1679AB] border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading attendance...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                          <p className="text-gray-500 font-medium">No punch records today</p>
                          <p className="text-sm text-gray-400 mt-1">Punch in to start tracking</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    punchRecords.map((record, i) => (
                      <tr key={record._id || i} className="bg-[#f1f8fd] hover:bg-[#e6f3fb] transition-colors">
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
                            {calculateSessionDuration(record.punchIn, record.punchOut)}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            !record.punchOut
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {!record.punchOut ? "ACTIVE" : "COMPLETED"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        {attendance && punchRecords.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-[#0a2540] mb-4">
              Summary Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-700">
                  {punchRecords.length}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 mb-1">Completed Sessions</p>
                <p className="text-2xl font-bold text-green-700">
                  {punchRecords.filter(r => r.punchOut).length}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600 mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {punchRecords.filter(r => !r.punchOut).length}
                </p>
              </div>
            </div>

            {/* Current Status */}
            {attendance.currentBreakStart && (
              <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                <div className="flex items-center">
                  <span className="text-orange-600 text-xl mr-2">☕</span>
                  <div>
                    <p className="font-bold text-orange-700">Currently on Break</p>
                    <p className="text-sm text-orange-600">
                      Break started at: {formatTime(attendance.currentBreakStart)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {punchRecords.some(r => !r.punchOut) && !attendance.currentBreakStart && (
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                <div className="flex items-center">
                  <span className="text-green-600 text-xl mr-2">✓</span>
                  <div>
                    <p className="font-bold text-green-700">Currently Working</p>
                    <p className="text-sm text-green-600">
                      Session in progress - Timer running
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyAttendance;