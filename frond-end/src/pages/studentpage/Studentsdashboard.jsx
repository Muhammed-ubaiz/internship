import { useState } from "react";
import LiveClockUpdate from "../LiveClockUpdate";
import DashboardCalendar from "../Dashboardcalender";
import SideBarStudent from "./SideBarStudent";
import axios from "axios";

function Studentsdashboard() {
  const [loading, setLoading] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);

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

  const handlePunchIn = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role")
    try {
      setLoading(true);
      const loc = await getCurrentLocation();

      const res = await axios.post("http://localhost:3001/student/punch-in", {
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Role:role,
        },
      }
    );

      setPunchInTime(res.data.attendance.punchInTime);
      alert("Punch In Successful");
    } catch (error) {
      alert(error);
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
    <div className="min-h-screen bg-[#EEF6FB] p-6">
      <SideBarStudent />

      {/* Main Content */}
      <div className="ml-0 lg:ml-56 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-[#141E46]">Dashboard</h1>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-5  hover:scale-105 transition">
            <p className="text-sm text-[#1679AB]">On Time Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">65%</h2>
            <p className="text-xs mt-1 text-red-500">-25% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#D1F7DC]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5  hover:scale-105 transition">
            <p className="text-sm text-[#1679AB]">Late Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">35%</h2>
            <p className="text-xs mt-1 text-green-500">+35% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#FDE2E2]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5  hover:scale-105 transition">
            <p className="text-sm text-[#1679AB]">Total Break Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">00h 40m 55s</h2>
            <p className="text-xs mt-1 text-red-500">-13% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#FFE7D1]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5  hover:scale-105 transition">
            <p className="text-sm text-[#1679AB]">Total Working Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">00h 40m 55s</h2>
            <p className="text-xs mt-1 text-green-500">+33% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#D1E8FF]" />
          </div>
        </div>

        {/* ================= DESKTOP BOTTOM ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="hidden lg:block">
            <DashboardCalendar />
          </div>

          <div className="hidden lg:flex h-80 bg-white rounded-2xl shadow-2xl  justify-center items-center">
            <LiveClockUpdate />
          </div>

          <div className="hidden lg:flex flex-col gap-4 w-full">
  {/* Punch In */}
  <div className="flex gap-4 w-full">
  {/* Punch In */}
  <div className="flex-1 bg-white rounded-2xl shadow-2xl p-4 ">
    <p className="text-sm text-[#1679AB]">Punch In Time</p>
    <p className="text-lg font-semibold text-[#141E46]">{formatTime(punchInTime)}</p>
  </div>

  {/* Punch Out */}
  <div className="flex-1 bg-white rounded-2xl shadow-2xl p-4 ">
    <p className="text-sm text-[#1679AB]">Punch Out Time</p>
    <p className="text-lg font-semibold text-[#141E46]">--:--</p>
  </div>
</div>

  {/* Today Break Hours */}
  <div className="bg-white rounded-2xl shadow-2xl p-4  w-full">
    <p className="text-sm text-[#1679AB]">Today Break Hours</p>
    <p className="text-lg font-semibold text-[#141E46]">00 Hr 00 Mins 55 Secs</p>
  </div>

  {/* Today Working Hours */}
  <div className="bg-white rounded-2xl shadow-2xl p-4  w-full">
    <p className="text-sm text-[#1679AB]">Today Working Hours</p>
    <p className="text-lg font-semibold text-[#141E46]">00 Hr 00 Mins 55 Secs</p>
  </div>

  {/* Punch Buttons */}
  <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
    <button
      onClick={handlePunchIn}
      disabled={loading}
      className="flex-1 bg-[#0dd635] hover:bg-[#0dd664] text-white py-3 rounded-lg font-semibold transition text-center"
    >
      Punch In
    </button>

    <button
      className="flex-1 bg-[#ed1717] hover:bg-[#d60d0de2] text-white py-3 rounded-lg font-semibold transition text-center"
    >
      Punch Out
    </button>
  </div>
</div>

        </div>
      </div>
    </div>
  );
}

export default Studentsdashboard;
