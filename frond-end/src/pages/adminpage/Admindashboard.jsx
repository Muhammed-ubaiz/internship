import React, { useEffect, useState } from "react";
import DashboardCalendar from "../Dashboardcalender";
import LiveClockUpdate from "../LiveClockUpdate";
import Sidebar from "./sidebar";
import Topbar from "./Topbar";
import axios from "axios";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // --------------------- FETCH STUDENTS ---------------------
  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.get("http://localhost:3001/admin/getStudents", {
        headers: { Authorization: `Bearer ${token}`, Role: role },
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  // --------------------- FETCH COURSES ---------------------
  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      const res = await axios.get("http://localhost:3001/admin/getCourse", {
        headers: { Authorization: `Bearer ${token}`, Role: role },
      });
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // --------------------- CALCULATE COUNTS ---------------------
  const activeStudentCount = students.filter((s) => s.status === "Active").length;
  const activeCourseCount = courses.filter((c) => c.status === "active").length;

  // Keep present/absent as static (from previous code)
  const presentStudents = 180; // original fixed value
  const absentStudents = 25;   // original fixed value

  return (
    <div className="min-h-screen bg-[#EEF6FB]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-3 md:p-6 md:ml-15">
        <div className="ml-37 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
              <Topbar />
              <h1 className="text-2xl font-semibold text-[#141E46]"></h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-10">
              {/* Active Students */}
              <div className="bg-white rounded-2xl shadow-2xl p-5 hover:scale-105 transition">
                <p className="text-sm text-[#1679AB]">Active Students</p>
                <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                  {activeStudentCount}
                </h2>
                <p className="text-xs mt-1 text-red-500">-25% compared to January</p>
                <div className="h-10 rounded mt-4 bg-[#D1F7DC]"></div>
              </div>

              {/* Active Courses */}
              <div className="bg-white rounded-2xl shadow-2xl p-5 hover:scale-105 transition">
                <p className="text-sm text-[#1679AB]">Active Courses</p>
                <h2 className="text-3xl font-bold text-[#141E46] mt-2">{activeCourseCount}</h2>
                <p className="text-xs mt-1 text-green-500">+35% compared to January</p>
                <div className="h-10 rounded mt-4 bg-[#FDE2E2]"></div>
              </div>

              {/* Present Students */}
              <div className="bg-white rounded-2xl shadow-2xl p-5 hover:scale-105 transition">
                <p className="text-sm text-[#1679AB]">Present Students</p>
                <h2 className="text-3xl font-bold text-[#141E46] mt-2">{presentStudents}</h2>
                <p className="text-xs mt-1 text-red-500">-13% compared to January</p>
                <div className="h-10 rounded mt-4 bg-[#FFE7D1]"></div>
              </div>

              {/* Absent Students */}
              <div className="bg-white rounded-2xl shadow-2xl p-5 hover:scale-105 transition">
                <p className="text-sm text-[#1679AB]">Absent Students</p>
                <h2 className="text-3xl font-bold text-[#141E46] mt-2">{absentStudents}</h2>
                <p className="text-xs mt-1 text-green-500">+33% compared to January</p>
                <div className="h-10 rounded mt-4 bg-[#D1E8FF]"></div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="hover:scale-105 transition">
                <DashboardCalendar />
              </div>

              <div className="h-80 bg-white rounded-2xl shadow-2xl flex justify-center items-center hover:scale-105 transition">
                <LiveClockUpdate />
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="h-35 bg-white rounded-2xl shadow-2xl p-4 hover:scale-105 transition">
                  <p className="text-sm text-[#1679AB]">Total Students Working Hours</p>
                  <p className="text-lg font-semibold text-[#141E46]">00 Hr 00 Min 00 Sec</p>
                </div>

                <div className="h-35 bg-white rounded-2xl shadow-2xl p-4 hover:scale-105 transition">
                  <p className="text-sm text-[#1679AB]">Total Students Break Hours</p>
                  <p className="text-lg font-semibold text-[#141E46]">00 Hr 00 Min 55 Sec</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
