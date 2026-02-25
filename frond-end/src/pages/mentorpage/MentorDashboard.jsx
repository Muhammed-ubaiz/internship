import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./Topbar";
import DashboardCalendar from "../Dashboardcalender";
import LiveClockUpdate from "../LiveClockUpdate";
import api from "../../utils/axiosConfig";

function MentorDashboard() {
  const [students, setStudents] = useState([]);

  // ---------------- FETCH STUDENTS ----------------
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      const res = await api.get("/mentor/getStudents", {
        headers: {
          Role: role,
        },
      });

      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ---------------- COUNTS ----------------
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "Active").length;
  const inactiveStudents = students.filter((s) => s.status === "Inactive").length;

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-0 lg:ml-56 max-w-7xl mx-auto">
        {/* Header with Topbar */}
        <div className="flex justify-center items-center mb-8">
          <Topbar />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* TOTAL STUDENTS */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-105">
            <p className="text-xs sm:text-sm text-[#1679AB]">Total Students</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141E46] mt-1 sm:mt-2">
              {totalStudents}
            </h2>
            <p className="text-[10px] sm:text-xs mt-1 text-red-500">
              -25% compared to January
            </p>
            <div className="h-8 sm:h-10 rounded mt-3 sm:mt-4 bg-[#D1F7DC]" />
          </div>

          {/* TOTAL COURSES */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-105">
            <p className="text-xs sm:text-sm text-[#1679AB]">Total Courses</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141E46] mt-1 sm:mt-2">
              6
            </h2>
            <p className="text-[10px] sm:text-xs mt-1 text-green-500">
              +35% compared to January
            </p>
            <div className="h-8 sm:h-10 rounded mt-3 sm:mt-4 bg-[#FDE2E2]" />
          </div>

          {/* PRESENT / ACTIVE STUDENTS */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-105">
            <p className="text-xs sm:text-sm text-[#1679AB]">Present Students</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141E46] mt-1 sm:mt-2">
              {activeStudents}
            </h2>
            <p className="text-[10px] sm:text-xs mt-1 text-red-500">
              -13% compared to January
            </p>
            <div className="h-8 sm:h-10 rounded mt-3 sm:mt-4 bg-[#FFE7D1]" />
          </div>

          {/* ABSENT / INACTIVE STUDENTS */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-105">
            <p className="text-xs sm:text-sm text-[#1679AB]">Absent Students</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141E46] mt-1 sm:mt-2">
              {inactiveStudents}
            </h2>
            <p className="text-[10px] sm:text-xs mt-1 text-green-500">
              +33% compared to January
            </p>
            <div className="h-8 sm:h-10 rounded mt-3 sm:mt-4 bg-[#D1E8FF]" />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar - Hidden on mobile/tablet, visible on desktop */}
          <div className="hidden lg:block transition-all duration-300 hover:scale-105">
            <DashboardCalendar />
          </div>

          {/* Live Clock - Hidden on mobile/tablet, visible on desktop */}
          <div className="hidden lg:flex h-80 bg-blue-50 rounded-2xl shadow-2xl justify-center items-center transition-all duration-300 hover:scale-105">
            <LiveClockUpdate />
          </div>

          {/* Working Hours Cards - Full width on mobile, grid on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Total Students Working Hours */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 transition-all duration-300 hover:scale-105">
              <p className="text-xs sm:text-sm text-[#1679AB]">
                Total Students Working Hours
              </p>
              <p className="text-base sm:text-lg font-semibold text-[#141E46] mt-1">
                00 Hr 00 Min 00 Sec
              </p>
            </div>

            {/* Total Students Break Hours */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 transition-all duration-300 hover:scale-105">
              <p className="text-xs sm:text-sm text-[#1679AB]">
                Total Students Break Hours
              </p>
              <p className="text-base sm:text-lg font-semibold text-[#141E46] mt-1">
                00 Hr 00 Min 55 Sec
              </p>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Calendar and Clock - Only visible on small screens */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="transition-all duration-300 hover:scale-105">
            <DashboardCalendar />
          </div>

          <div className="h-64 sm:h-80 bg-blue-50 rounded-2xl shadow-2xl flex justify-center items-center transition-all duration-300 hover:scale-105">
            <LiveClockUpdate />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;