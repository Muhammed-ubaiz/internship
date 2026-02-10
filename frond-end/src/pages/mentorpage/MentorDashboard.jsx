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

  const activeStudents = students.filter(
    (s) => s.status === "Active"
  ).length;

  const inactiveStudents = students.filter(
    (s) => s.status === "Inactive"
  ).length;

  return (
    <div className="min-h-screen bg-[#EEF6FB] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-4 md:px-6 pt-4 md:ml-52">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Topbar />
            <h1 className="text-2xl font-semibold text-[#141E46]"></h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* TOTAL STUDENTS */}
            <div className="bg-white rounded-2xl shadow-2xl p-5 transition-all duration-300 hover:scale-105">
              <p className="text-sm text-[#1679AB]">Total Students</p>
              <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                {totalStudents}
              </h2>
              <p className="text-xs mt-1 text-red-500">
                -25% compared to January
              </p>
              <div className="h-10 rounded mt-4 bg-[#D1F7DC]" />
            </div>

            {/* TOTAL COURSES */}
            <div className="bg-white rounded-2xl shadow-2xl p-5 transition-all duration-300 hover:scale-105">
              <p className="text-sm text-[#1679AB]">Total Courses</p>
              <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                6
              </h2>
              <p className="text-xs mt-1 text-green-500">
                +35% compared to January
              </p>
              <div className="h-10 rounded mt-4 bg-[#FDE2E2]" />
            </div>

            {/* PRESENT / ACTIVE STUDENTS */}
            <div className="bg-white rounded-2xl shadow-2xl p-5 transition-all duration-300 hover:scale-105">
              <p className="text-sm text-[#1679AB]">Present Students</p>
              <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                {activeStudents}
              </h2>
              <p className="text-xs mt-1 text-red-500">
                -13% compared to January
              </p>
              <div className="h-10 rounded mt-4 bg-[#FFE7D1]" />
            </div>

            {/* ABSENT / INACTIVE STUDENTS */}
            <div className="bg-white rounded-2xl shadow-2xl p-5 transition-all duration-300 hover:scale-105">
              <p className="text-sm text-[#1679AB]">Absent Students</p>
              <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                {inactiveStudents}
              </h2>
              <p className="text-xs mt-1 text-green-500">
                +33% compared to January
              </p>
              <div className="h-10 rounded mt-4 bg-[#D1E8FF]" />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="transition-all duration-300 hover:scale-105">
              <DashboardCalendar />
            </div>

            <div className="h-80 bg-blue-50 rounded-2xl shadow-2xl flex justify-center items-center transition-all duration-300 hover:scale-105">
              <LiveClockUpdate />
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="h-36 bg-white rounded-2xl shadow-2xl p-4 transition-all duration-300 hover:scale-105">
                <p className="text-sm text-[#1679AB]">
                  Total Students Working Hours
                </p>
                <p className="text-lg font-semibold text-[#141E46]">
                  00 Hr 00 Min 00 Sec
                </p>
              </div>

              <div className="h-36 bg-white rounded-2xl shadow-2xl p-4 transition-all duration-300 hover:scale-105">
                <p className="text-sm text-[#1679AB]">
                  Total Students Break Hours
                </p>
                <p className="text-lg font-semibold text-[#141E46]">
                  00 Hr 00 Min 55 Sec
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
