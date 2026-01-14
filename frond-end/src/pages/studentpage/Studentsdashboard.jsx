import { useState, useEffect } from "react";
import LiveClockUpdate from "../LiveClockUpdate";
import DashboardCalendar from "../Dashboardcalender";
import SideBarStudent from "./SideBarStudent";
import StudentTopbar from "./StudentTopbar";
import axios from "axios";

function Studentsdashboard() {
  const [loading, setLoading] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [workingHours, setWorkingHours] = useState("00 Hr 00 Mins 00 Secs");
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [liveWorkingTime, setLiveWorkingTime] = useState("00 Hr 00 Mins 00 Secs");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [liveBreakingTime, setLiveBreakTime] = useState("00 Hr 00 Mins 00 Secs");
  const [breakingHours, setBreakingHours] = useState("00 Hr 00 Mins 00 Secs")
  const [breakSeconds, setBreakSeconds] = useState(0); // total break time in seconds

  // ✅ CHANGE 1: Fixed loadTodayAttendance function
 useEffect(() => {
  const loadTodayAttendance = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.get("http://localhost:3001/student/today-attendance", {
        headers: { Authorization: `Bearer ${token}`, role },
      });

      if (res.data.attendance) {
        const attendance = res.data.attendance;

        if (attendance.punchInTime) setPunchInTime(attendance.punchInTime);
        setIsOnBreak(!!attendance.breakStartTime);

        // Restore break time in seconds
        setBreakSeconds(attendance.totalBreakSeconds || 0);

        if (attendance.punchOutTime) {
          setPunchOutTime(attendance.punchOutTime);
          setIsPunchedIn(false);

          // Calculate working hours
          const workTime = calculateWorkingHours(attendance.punchInTime, attendance.punchOutTime);
          setWorkingHours(workTime.formatted);
          setLiveWorkingTime(workTime.formatted);

          // Save final break time
          setBreakingHours(formatSeconds(attendance.totalBreakSeconds || 0));
        } else {
          setPunchOutTime(null);
          setIsPunchedIn(!!attendance.punchInTime && !attendance.breakStartTime);
        }
      } else {
        // No attendance today
        setPunchInTime(null);
        setPunchOutTime(null);
        setIsPunchedIn(false);
        setIsOnBreak(false);
        setBreakSeconds(0);
        setWorkingHours("00 Hr 00 Mins 00 Secs");
        setLiveWorkingTime("00 Hr 00 Mins 00 Secs");
        setBreakingHours("00 Hr 00 Mins 00 Secs");
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
    }
  };

  loadTodayAttendance();
}, []);

  // Institution coordinates
  const INSTITUTION_LAT = 11.280690661846767;
  const INSTITUTION_LNG = 75.77060212210458;
  const MAX_DISTANCE = 50;

  // Live timer for working hours
  useEffect(() => {
    if (!punchInTime || punchOutTime || isOnBreak) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(punchInTime);
      const diff = Math.floor((now - start) / 1000);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setLiveWorkingTime(
        `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(
          2,
          "0"
        )} Mins ${String(seconds).padStart(2, "0")} Secs`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [punchInTime, punchOutTime, isOnBreak]);

  // 🔔 Live Break Timer
  useEffect(() => {
    if (!isOnBreak) return;

    const interval = setInterval(() => {
      setBreakSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnBreak]);

useEffect(() => {
  if (!isOnBreak || punchOutTime) return;

  const interval = setInterval(() => {
    setBreakSeconds((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, [isOnBreak, punchOutTime]);

// Update liveBreakingTime from breakSeconds
useEffect(() => {
  setLiveBreakTime(formatSeconds(breakSeconds));
}, [breakSeconds]);

// Helper: format seconds into Hr/Min/Sec
const formatSeconds = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2,"0")} Hr ${String(mins).padStart(2,"0")} Mins ${String(secs).padStart(2,"0")} Secs`;
};

// On Punch Out
const handlePunchOut = async () => {
  if (!isPunchedIn) return alert("You must punch in first!");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  try {
    setLoading(true);
    setLocationStatus("Processing punch out...");

    const loc = await getCurrentLocation();

    const res = await axios.post(
      "http://localhost:3001/student/punch-out",
      { latitude: loc.latitude, longitude: loc.longitude },
      { headers: { Authorization: `Bearer ${token}`, role } }
    );

    setPunchOutTime(res.data.attendance.punchOutTime);
    setIsPunchedIn(false);
    setIsOnBreak(false); // stop break timer

    // Calculate total working hours
    const workTime = calculateWorkingHours(punchInTime, res.data.attendance.punchOutTime);
    setWorkingHours(workTime.formatted);

    // Save final break time
    setBreakingHours(formatSeconds(breakSeconds));

    setLocationStatus(`✅ Punch out successful! Total working time: ${workTime.formatted}`);
    alert(`Punch Out Successful! ✅\nTotal Working Hours: ${workTime.formatted}`);
  } catch (err) {
    alert(err?.response?.data?.message || err.message || "Punch Out Failed");
    setLocationStatus("❌ Punch out error");
  } finally {
    setLoading(false);
  }
};

  // Distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject("Geolocation not supported");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error.message)
      );
    });
  };

  const calculateWorkingHours = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = Math.floor((end - start) / 1000);

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return {
      formatted: `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(
        2,
        "0"
      )} Mins ${String(seconds).padStart(2, "0")} Secs`,
      totalSeconds: diff,
      hours,
      minutes,
      seconds,
    };
  };

  const handlePunchIn = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      setLoading(true);
      setLocationStatus("Getting your location...");

      const loc = await getCurrentLocation();

      const distance = calculateDistance(
        loc.latitude,
        loc.longitude,
        INSTITUTION_LAT,
        INSTITUTION_LNG
      );

      setLocationStatus(`Distance from institution: ${Math.round(distance)}m`);

      if (distance > MAX_DISTANCE) {
        alert(
          `❌ Punch In Denied\nYou are ${Math.round(
            distance
          )} meters away from Aviv Digital Academy.`
        );
        setLocationStatus(`❌ Too far from institution (${Math.round(distance)}m)`);
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:3001/student/punch-in",
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          distance,
        },
        {
          headers: { Authorization: `Bearer ${token}`, role },
        }
      );

      setPunchInTime(res.data.attendance.punchInTime);
      setIsPunchedIn(true);
      setPunchOutTime(null);
      setWorkingHours("00 Hr 00 Mins 00 Secs");
      setLocationStatus("✅ Punched in successfully!");
      alert("Punch In Successful! ✅");
    } catch (error) {
      alert(error?.response?.data?.message || error.message || "Punch In Failed");
      setLocationStatus("❌ Location error");
    } finally {
      setLoading(false);
    }
  };


  const formatTime = (time) => {
    if (!time) return "--:--";
    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <SideBarStudent />

      <div className="ml-0 lg:ml-56 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <StudentTopbar />
        </div>

        {/* Location Status Banner */}
        {locationStatus && (
          <div
            className={`mb-4 p-3 rounded-lg text-center font-semibold ${
              locationStatus.includes("✅")
                ? "bg-green-100 text-green-700"
                : locationStatus.includes("❌")
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {locationStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">On Time Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">65%</h2>
            <p className="text-xs mt-1 text-red-500">-25% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#D1F7DC]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Late Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">35%</h2>
            <p className="text-xs mt-1 text-green-500">+35% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#FDE2E2]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Total Break Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">00h 00m 00s</h2>
            <p className="text-xs mt-1 text-red-500">-13% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#FFE7D1]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Total Working Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">{isPunchedIn ? liveWorkingTime : workingHours}</h2>
            <p className="text-xs mt-1 text-green-500">+33% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#D1E8FF]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hidden lg:block">
            <DashboardCalendar />
          </div>

          <div className="hidden lg:flex h-80 bg-blue-50 rounded-2xl shadow-2xl justify-center items-center">
            <LiveClockUpdate />
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <p className="text-sm text-[#1679AB]">Punch In Time</p>
                <p className="text-lg font-semibold text-[#141E46]">
                  {formatTime(punchInTime)}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <p className="text-sm text-[#1679AB]">Punch Out Time</p>
                <p className="text-lg font-semibold text-[#141E46]">
                  {formatTime(punchOutTime)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4">
              <p className="text-sm text-[#1679AB]">Today Break Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">
              {isOnBreak ? liveBreakingTime : breakingHours}
            </p>

            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4">
              <p className="text-sm text-[#1679AB]">Today Working Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">
                {isPunchedIn ? liveWorkingTime : workingHours}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <button
                onClick={handlePunchIn}
                disabled={loading || isPunchedIn}
                className={`${
                  loading || isPunchedIn
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0dd635] hover:bg-[#0dd664]"
                } text-white py-3 rounded-lg font-semibold transition-colors`}
              >
                {loading && !isPunchedIn
                  ? "Checking Location..."
                  : isPunchedIn
                  ? "Already Punched In"
                  : "Punch In"}
              </button>

              <button
                onClick={handlePunchOut}
                disabled={loading || !isPunchedIn}
                className={`${
                  loading || !isPunchedIn
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#ed1717] hover:bg-[#d60d0de2]"
                } text-white py-3 rounded-lg font-semibold transition-colors`}
              >
                {loading && isPunchedIn ? "Processing..." : "Punch Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Studentsdashboard;