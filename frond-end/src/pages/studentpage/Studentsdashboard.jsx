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

  // Break timer states
  const [breakTime, setBreakTime] = useState(0);
  const [liveBreakTime, setLiveBreakTime] = useState("00 Hr 00 Mins 00 Secs");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);

  // Total accumulated working time
  const [totalWorkingTime, setTotalWorkingTime] = useState(0);

  // ✅ Load today's attendance - FIXED
  useEffect(() => {
    const loadTodayAttendance = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      try {
        const res = await axios.get("http://localhost:3001/student/today-attendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role,
          },
        });

        if (res.data.attendance) {
          const attendance = res.data.attendance;
          
          // ✅ STEP 1: Load accumulated times FIRST
          if (attendance.totalWorkingTime !== undefined) {
            setTotalWorkingTime(attendance.totalWorkingTime);
            // Display the accumulated time immediately
            const formattedTotal = formatTimeFromSeconds(attendance.totalWorkingTime);
            setWorkingHours(formattedTotal);
            setLiveWorkingTime(formattedTotal);
          }

          if (attendance.totalBreakTime !== undefined) {
            setBreakTime(attendance.totalBreakTime);
            setLiveBreakTime(formatTimeFromSeconds(attendance.totalBreakTime));
          }
          
          // ✅ STEP 2: Set punch times
          if (attendance.punchInTime) {
            setPunchInTime(attendance.punchInTime);
          }
          
          // ✅ STEP 3: Check status
          if (attendance.punchOutTime) {
            // Already punched out - on break
            setPunchOutTime(attendance.punchOutTime);
            setIsPunchedIn(false);
            
            // Start break timer
            setIsOnBreak(true);
            setBreakStartTime(attendance.breakStartTime || attendance.punchOutTime);
          } else {
            // Still punched in - working
            setIsPunchedIn(true);
            setPunchOutTime(null);
            setIsOnBreak(false);
          }
        } else {
          // No attendance record - reset
          resetDashboard();
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
        resetDashboard();
      }
    };

    loadTodayAttendance();
  }, []);

  const resetDashboard = () => {
    setPunchInTime(null);
    setPunchOutTime(null);
    setIsPunchedIn(false);
    setWorkingHours("00 Hr 00 Mins 00 Secs");
    setLiveWorkingTime("00 Hr 00 Mins 00 Secs");
    setBreakTime(0);
    setLiveBreakTime("00 Hr 00 Mins 00 Secs");
    setIsOnBreak(false);
    setBreakStartTime(null);
    setTotalWorkingTime(0);
  };

  const INSTITUTION_LAT = 11.280690661846767;
  const INSTITUTION_LNG = 75.77060212210458;
  const MAX_DISTANCE = 50;

  // Live break timer
  useEffect(() => {
    if (!isOnBreak || !breakStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const breakStart = new Date(breakStartTime);
      const currentBreakSeconds = Math.floor((now - breakStart) / 1000);
      
      const totalBreakSeconds = breakTime + currentBreakSeconds;
      setLiveBreakTime(formatTimeFromSeconds(totalBreakSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnBreak, breakStartTime, breakTime]);

  // Live working timer
  useEffect(() => {
    if (!punchInTime || punchOutTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(punchInTime);
      const currentSessionSeconds = Math.floor((now - start) / 1000);
      
      // Add current session to total accumulated
      const totalSeconds = totalWorkingTime + currentSessionSeconds;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setLiveWorkingTime(
        `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(2, "0")} Mins ${String(seconds).padStart(2, "0")} Secs`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [punchInTime, punchOutTime, totalWorkingTime]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }
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
      formatted: `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(2, "0")} Mins ${String(seconds).padStart(2, "0")} Secs`,
      totalSeconds: diff,
      hours,
      minutes,
      seconds,
    };
  };

  const formatTimeFromSeconds = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(2, "0")} Mins ${String(seconds).padStart(2, "0")} Secs`;
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

      console.log("Distance:", distance, "meters");
      setLocationStatus(`Distance: ${Math.round(distance)}m`);

      if (distance > MAX_DISTANCE) {
        const distanceInKm = (distance / 1000).toFixed(2);
        alert(
          `❌ Punch In Denied\n\nYou are ${Math.round(distance)}m (${distanceInKm}km) away.\n\nMust be within ${MAX_DISTANCE}m.`
        );
        setLocationStatus(`❌ Too far (${Math.round(distance)}m)`);
        setLoading(false);
        return;
      }

      // Calculate final break time
      let finalBreakTime = breakTime;
      if (isOnBreak && breakStartTime) {
        const now = new Date();
        const breakStart = new Date(breakStartTime);
        const currentBreakSeconds = Math.floor((now - breakStart) / 1000);
        finalBreakTime = breakTime + currentBreakSeconds;
      }

      const res = await axios.post(
        "http://localhost:3001/student/punch-in",
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          distance: distance,
          totalBreakTime: finalBreakTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role,
          },
        }
      );

      setPunchInTime(res.data.attendance.punchInTime);
      setIsPunchedIn(true);
      setPunchOutTime(null);
      
      // Stop break timer
      setIsOnBreak(false);
      setBreakStartTime(null);
      setBreakTime(finalBreakTime);
      setLiveBreakTime(formatTimeFromSeconds(finalBreakTime));
      
      alert("Punch In Successful! ✅");
      setLocationStatus(`✅ Punched in at ${Math.round(distance)}m`);
    } catch (error) {
      alert(error?.response?.data?.message || "Punch In Failed");
      setLocationStatus("❌ Error");
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!isPunchedIn) {
      alert("You must punch in first!");
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      setLoading(true);
      setLocationStatus("Processing punch out...");

      const loc = await getCurrentLocation();

      const res = await axios.post(
        "http://localhost:3001/student/punch-out",
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role,
          },
        }
      );

      setPunchOutTime(res.data.attendance.punchOutTime);
      setIsPunchedIn(false);
      
      // ✅ Backend returns total accumulated time
      const newTotalWorkingTime = res.data.attendance.totalWorkingTime;
      setTotalWorkingTime(newTotalWorkingTime);
      
      const formattedTotal = formatTimeFromSeconds(newTotalWorkingTime);
      setWorkingHours(formattedTotal);
      setLiveWorkingTime(formattedTotal);
      
      // Start break timer
      setIsOnBreak(true);
      setBreakStartTime(res.data.attendance.breakStartTime || res.data.attendance.punchOutTime);
      
      setLocationStatus(`✅ Total: ${formattedTotal}`);
      alert(`Punch Out Successful! ✅\n\nTotal Working Hours: ${formattedTotal}`);
      
    } catch (error) {
      alert(error?.response?.data?.message || "Punch Out Failed");
      setLocationStatus("❌ Error");
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
            <div className="h-10 rounded mt-4 bg-[#D1F7DC]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Late Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">35%</h2>
            <div className="h-10 rounded mt-4 bg-[#FDE2E2]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Total Break Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">
              {isOnBreak ? liveBreakTime : formatTimeFromSeconds(breakTime)}
            </h2>
            <div className="h-10 rounded mt-4 bg-[#FFE7D1]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Total Working Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">
              {isPunchedIn ? liveWorkingTime : workingHours}
            </h2>
            <div className="h-10 rounded mt-4 bg-[#D1E8FF]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hidden lg:block">
            <DashboardCalendar />
          </div>

          <div className="hidden lg:flex h-80 bg-white rounded-2xl shadow-2xl justify-center items-center">
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
                {isOnBreak ? liveBreakTime : formatTimeFromSeconds(breakTime)}
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