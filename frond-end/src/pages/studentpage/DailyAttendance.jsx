import React, { useEffect, useState, useRef } from "react";
import api from "../../utils/axiosConfig";
import SideBarStudent from "./SideBarStudent";

function DailyAttendance() {
  const [attendance, setAttendance] = useState(null);
  const [punchRecords, setPunchRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Start live timer when we have an active session
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (attendance) {
      // Calculate initial live seconds
      updateLiveTime();

      // Update every second if there's an active session
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

      // Calculate already counted working time for this session from totalWorkingSeconds
      // We need to add only the time since the last update
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

      console.log("Attendance response:", res.data);

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

        // Initialize live time
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
    if (!seconds || seconds < 0) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
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

  // Check if there's an active session
  const hasActiveSession = punchRecords.some(r => !r.punchOut);
  const isOnBreak = attendance?.currentBreakStart;

  return (
    <div className="flex min-h-screen bg-[#eef5f9] p-5">
      {/* Sidebar */}
      <SideBarStudent />

      {/* Main Content */}
      <div className="md:ml-60 w-full pt-14 md:pt-0 px-4 md:px-6 lg:px-8 py-6">

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#0a2540] text-center sm:text-left w-full sm:w-auto">
            Today's Attendance Records
          </h2>
          <button
            onClick={fetchAttendance}
            className="w-full sm:w-auto px-4 py-2 bg-[#1679AB] text-white rounded-lg hover:bg-[#0d5a87] transition-colors flex items-center justify-center gap-2"
          >
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start sm:items-center gap-2">
              <span className="text-red-600 text-lg flex-shrink-0">Warning</span>
              <p className="text-red-700 font-medium text-sm md:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Cards with Live Timer */}
        {attendance && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
              <p className="text-xs md:text-sm text-[#1679AB] mb-2">Date</p>
              <h3 className="text-lg md:text-xl font-bold text-[#141E46]">
                {formatDate(attendance.date)}
              </h3>
            </div>

            <div className={`bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 ${hasActiveSession && !isOnBreak ? 'ring-2 ring-green-400' : ''}`}>
              <p className="text-xs md:text-sm text-[#1679AB] mb-2 flex items-center gap-2">
                Total Working Time
                {hasActiveSession && !isOnBreak && (
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                )}
              </p>
              <h3 className="text-lg md:text-xl font-bold text-green-600 font-mono">
                {formatDuration(liveWorkingSeconds)}
              </h3>
              {hasActiveSession && !isOnBreak && (
                <p className="text-xs text-green-500 mt-1">Live updating...</p>
              )}
            </div>

            <div className={`bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 ${isOnBreak ? 'ring-2 ring-orange-400' : ''}`}>
              <p className="text-xs md:text-sm text-[#1679AB] mb-2 flex items-center gap-2">
                Total Break Time
                {isOnBreak && (
                  <span className="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                )}
              </p>
              <h3 className="text-lg md:text-xl font-bold text-orange-600 font-mono">
                {formatDuration(liveBreakSeconds)}
              </h3>
              {isOnBreak && (
                <p className="text-xs text-orange-500 mt-1">On break...</p>
              )}
            </div>

            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
              <p className="text-xs md:text-sm text-[#1679AB] mb-2">Status</p>
              <h3
                className={`text-lg md:text-xl font-bold ${attendance.status === "WORKING"
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

        {/* Punch Records Summary */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-[#0a2540] mb-4">
            Punch In/Out Summary
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#1679AB] border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4 text-sm md:text-base">
                Loading attendance...
              </p>
            </div>
          ) : punchRecords.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-2">📋</span>
              <p className="text-gray-500 font-medium">No punch records today</p>
              <p className="text-sm text-gray-400 mt-1">
                Punch in to start tracking
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* First Punch In */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-green-600 font-medium">First Punch In</p>
                    <p className="text-xs text-green-500">Start of day</p>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-green-700 font-mono">
                  {formatTime(punchRecords[0]?.punchIn)}
                </p>
                {hasActiveSession && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-green-600 font-medium">Session Active</span>
                  </div>
                )}
              </div>

              {/* Last Punch Out */}
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 md:p-6 border border-red-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✕</span>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-red-600 font-medium">Last Punch Out</p>
                    <p className="text-xs text-red-500">End of session</p>
                  </div>
                </div>
                {punchRecords[punchRecords.length - 1]?.punchOut ? (
                  <p className="text-2xl md:text-3xl font-bold text-red-700 font-mono">
                    {formatTime(punchRecords[punchRecords.length - 1]?.punchOut)}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xl md:text-2xl font-bold text-yellow-600">
                      Still Working
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      <span className="text-xs text-yellow-600 font-medium">Not punched out yet</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Session Count Info */}
              <div className="md:col-span-2 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">#</span>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Sessions Today</p>
                      <p className="text-xs text-blue-500">Number of punch in/out cycles</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    {punchRecords.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyAttendance;
