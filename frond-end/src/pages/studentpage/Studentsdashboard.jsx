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

  // ✅ CHANGE 1: Fixed loadTodayAttendance function
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
          
          // Always set punch in time if it exists
          if (attendance.punchInTime) {
            setPunchInTime(attendance.punchInTime);
          }
          
          // Check if punch out exists
          if (attendance.punchOutTime) {
            // Already punched out
            setPunchOutTime(attendance.punchOutTime);
            setIsPunchedIn(false);
            
            // Calculate total working hours
            const workTime = calculateWorkingHours(
              attendance.punchInTime, 
              attendance.punchOutTime
            );
            setWorkingHours(workTime.formatted);
            setLiveWorkingTime(workTime.formatted);
          } else {
            // Still punched in (no punch out yet)
            setIsPunchedIn(true);
            setPunchOutTime(null);
          }
        } else {
          // No attendance record for today - reset everything
          setPunchInTime(null);
          setPunchOutTime(null);
          setIsPunchedIn(false);
          setWorkingHours("00 Hr 00 Mins 00 Secs");
          setLiveWorkingTime("00 Hr 00 Mins 00 Secs");
        }
      } catch (error) {
        console.error("Error loading today's attendance:", error);
        // Reset state on error
        setPunchInTime(null);
        setPunchOutTime(null);
        setIsPunchedIn(false);
      }
    };

    loadTodayAttendance();
  }, []);

  // Institution coordinates from Google Maps link
  // Aviv Digital Academy - Kozhikode, Kerala
  const INSTITUTION_LAT = 11.280690661846767 ; 
  const INSTITUTION_LNG = 75.77060212210458 ;
  const MAX_DISTANCE = 50; 

  // Live timer for working hours
  useEffect(() => {
    if (!punchInTime || punchOutTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(punchInTime);
      const diff = Math.floor((now - start) / 1000); // difference in seconds

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setLiveWorkingTime(
        `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(2, "0")} Mins ${String(seconds).padStart(2, "0")} Secs`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [punchInTime, punchOutTime]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
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
    const diff = Math.floor((end - start) / 1000); // difference in seconds

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

  const handlePunchIn = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      setLoading(true);
      setLocationStatus("Getting your location...");

      const loc = await getCurrentLocation();

      // Calculate distance from institution
      const distance = calculateDistance(
        loc.latitude,
        loc.longitude,
        INSTITUTION_LAT,
        INSTITUTION_LNG
      );

      console.log("Current Location:", loc);
      console.log("Institution Location:", { lat: INSTITUTION_LAT, lng: INSTITUTION_LNG });
      console.log("Distance:", distance, "meters");

      setLocationStatus(`Distance from institution: ${Math.round(distance)}m`);

      // Check if within 50 meters
      if (distance > MAX_DISTANCE) {
        const distanceInKm = (distance / 1000).toFixed(2);
        alert(
          `❌ Punch In Denied\n\nYou are ${Math.round(distance)} meters (${distanceInKm} km) away from Aviv Digital Academy.\n\nYou must be within ${MAX_DISTANCE} meters to punch in.\n\nPlease come to the institution premises.`
        );
        setLocationStatus(`❌ Too far from institution (${Math.round(distance)}m)`);
        setLoading(false);
        return;
      }

      setLocationStatus(`✅ Within range (${Math.round(distance)}m)`);

      // Proceed with punch in
      const res = await axios.post(
        "http://localhost:3001/student/punch-in",
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          distance: distance,
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
      setWorkingHours("00 Hr 00 Mins 00 Secs");
      alert("Punch In Successful! ✅");
      setLocationStatus(`✅ Punched in successfully at ${Math.round(distance)}m from institution`);
    } catch (error) {
      alert(error?.response?.data?.message || error.message || "Punch In Failed");
      setLocationStatus("❌ Location error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHANGE 2: Fixed handlePunchOut function
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

      // Send punch out request to backend (backend will create the time)
      const res = await axios.post(
        "http://localhost:3001/student/punch-out",
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          // Removed workingHours - backend will calculate it
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role,
          },
        }
      );

      // Get the punch out time from backend response
      setPunchOutTime(res.data.attendance.punchOutTime);
      setIsPunchedIn(false);
      
      // Calculate working hours for display
      const workTime = calculateWorkingHours(
        punchInTime, 
        res.data.attendance.punchOutTime
      );
      setWorkingHours(workTime.formatted);
      
      setLocationStatus(`✅ Punch out successful! Total working time: ${workTime.formatted}`);
      alert(`Punch Out Successful! ✅\n\nTotal Working Hours: ${workTime.formatted}`);
      
    } catch (error) {
      alert(error?.response?.data?.message || error.message || "Punch Out Failed");
      setLocationStatus("❌ Punch out error");
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
                00 Hr 00 Mins 00 Secs
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