import React,{ useState } from "react";
import LiveClockUpdate from "../LiveClockUpdate";
import DashboardCalendar from "../Dashboardcalender";
import SideBarStudent from "./SideBarStudent";
import axios from "axios";


function Studentsdashboard() {

  const [location, setLocation] = useState(null);
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
    try {
      setLoading(true);

      const loc = await getCurrentLocation();
      setLocation(loc);

      await axios.post("http://localhost:3001/student/punch-in", {
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

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
      <div className="ml-0 lg:ml-[225px] max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-[#141E46]">
            Dashboard
          </h1>
        </div>

        {/* ================= MOBILE TOP SECTION ================= */}
        {/* 🔥 EVERYTHING AT TOP – MOBILE ONLY */}
        <div className="lg:hidden space-y-4 mb-8">

          {/* Punch Buttons */}
          <div className="flex gap-3">
            <button className="w-full bg-[#0dd635] hover:bg-[#0dd664] text-white py-3 rounded-lg font-semibold transition">
              Punch In
            </button>
            <button className="w-full bg-[#ed1717] hover:bg-[#d60d0de2] text-white py-3 rounded-lg font-semibold transition">
              Punch Out
            </button>
          </div>

          {/* Punch Times */}
          <div className="flex gap-3">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border w-1/2">
              <p className="text-sm text-[#1679AB]">Punch In Time</p>
              <p className="text-lg font-semibold text-[#141E46]">
                11:11 AM
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4 border w-1/2">
              <p className="text-sm text-[#1679AB]">Punch Out Time</p>
              <p className="text-lg font-semibold text-[#141E46]">
                11:11 AM
              </p>
            </div>
          </div>

          {/* Break Time */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 border">
            <p className="text-sm text-[#1679AB]">Today Break Hours</p>
            <p className="text-lg font-semibold text-[#141E46]">
              00 Hr 00 Mins 55 Secs
            </p>
          </div>

          {/* Working Time */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 border">
            <p className="text-sm text-[#1679AB]">Today Working Hours</p>
            <p className="text-lg font-semibold text-[#141E46]">
              00 Hr 00 Mins 55 Secs
            </p>
          </div>

        </div>
        {/* ================= END MOBILE TOP ================= */}

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
            <p className="text-sm text-[#1679AB]">On Time Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">65%</h2>
            <p className="text-xs mt-1 text-red-500">-25% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#D1F7DC]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
            <p className="text-sm text-[#1679AB]">Late Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">35%</h2>
            <p className="text-xs mt-1 text-green-500">+35% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#FDE2E2]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
            <p className="text-sm text-[#1679AB]">Total Break Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">
              00h 40m 55s
            </h2>
            <p className="text-xs mt-1 text-red-500">-13% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#FFE7D1]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5 border hover:scale-105 transition">
            <p className="text-sm text-[#1679AB]">Total Working Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">
              00h 40m 55s
            </h2>
            <p className="text-xs mt-1 text-green-500">+33% compared to January</p>
            <div className="h-10 rounded mt-4 bg-[#D1E8FF]" />
          </div>

        </div>

        {/* ================= DESKTOP BOTTOM ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="hidden lg:block">
            <DashboardCalendar />
          </div>

          <div className="hidden lg:flex h-80 bg-white rounded-2xl shadow-2xl border justify-center items-center">
            <LiveClockUpdate />
          </div>

          <div className="hidden lg:block space-y-4">


            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200 w-[50%]">
              <p className="text-sm text-[#1679AB]">Punch in Time </p>
              <p className="text-lg font-semibold text-[#141E46]">
               {formatTime(punchInTime)}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200 w-[50%]">
              <p className="text-sm text-[#1679AB]">Punch out Time </p>
              <p className="text-lg font-semibold text-[#141E46]">
                11:11 AM
              </p>
            </div>

            <div className="flex gap-3">
              <div className="bg-white rounded-2xl shadow-2xl p-4 border w-1/2">
                <p className="text-sm text-[#1679AB]">Punch in Time</p>
                <p className="text-lg font-semibold text-[#141E46]">11:11 AM</p>
              </div>
              <div className="bg-white rounded-2xl shadow-2xl p-4 border w-1/2">
                <p className="text-sm text-[#1679AB]">Punch out Time</p>
                <p className="text-lg font-semibold text-[#141E46]">11:11 AM</p>
              </div>

            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4 border">
              <p className="text-sm text-[#1679AB]">Today Break Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">
                00 Hr 00 Mins 55 Secs
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4 border">
              <p className="text-sm text-[#1679AB]">Today Working Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">
                00 Hr 00 Mins 55 Secs
              </p>
            </div>


            <button onClick={handlePunchIn} 
             disabled={loading}

             className="w-full bg-[#0dd635] hover:bg-[#0dd664] text-white py-3 rounded-lg font-semibold transition">
              Punch In
            </button>
            <button className="w-full bg-[#ed1717] hover:bg-[#d60d0de2] text-white py-3 rounded-lg font-semibold transition">
              Punch Out
            </button>

            <div className="flex gap-3">
              <button className="w-full bg-[#0dd635] text-white py-3 rounded-lg font-semibold">
                Punch In
              </button>
              <button className="w-full bg-[#ed1717] text-white py-3 rounded-lg font-semibold">
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
