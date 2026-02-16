import React, { useEffect, useState } from "react";
import DashboardCalendar from "../Dashboardcalender";
import LiveClockUpdate from "../LiveClockUpdate";
import Sidebar from "./sidebar";
import Topbar from "./Topbar";
import api from "../../utils/axiosConfig";

function Admindashboard() {

  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [activeCoursesCount, setActiveCoursesCount] = useState(0);
  const [activeMentorsCount, setActiveMentorsCount] = useState(0); // ✅ NEW STATE

  // ---------------- FETCH ACTIVE STUDENTS ----------------
  const fetchActiveStudentsCount = async () => {
    const role = localStorage.getItem("role");

    try {
      const res = await api.get("/admin/getStudents");

      const activeStudents = res.data.filter(
        (student) => student.status === "Active"
      );

      setActiveStudentsCount(activeStudents.length);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  // ---------------- FETCH ACTIVE COURSES ----------------
  const fetchActiveCoursesCount = async () => {
    const role = localStorage.getItem("role");

    try {
      const res = await api.get("/admin/getCourse");

      const activeCourses = res.data.filter(
        (course) => course.status === "active"
      );

      setActiveCoursesCount(activeCourses.length);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  // ---------------- FETCH ACTIVE MENTORS ----------------
  const fetchActiveMentorsCount = async () => {
    const role = localStorage.getItem("role");

    try {
      const res = await api.get("/admin/getMentors");


      // Mentorcreate code pole response.data.mentors aanu
      const activeMentors = res.data.mentors.filter(
        (mentor) => mentor.status === "Active"
      );

      setActiveMentorsCount(activeMentors.length);

    } catch (error) {
      console.error("Failed to fetch mentors", error);
    }
  };

  useEffect(() => {
    fetchActiveStudentsCount();
    fetchActiveCoursesCount();
    fetchActiveMentorsCount(); // ✅ CALL
  }, []);

  return (
    <div className="min-h-screen bg-[#EEF6FB] flex pt-14 lg:pt-0">
      <Sidebar />

      <div className="flex-1 p-3 md:p-6 ml-0 lg:ml-52 max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Topbar />
          </div>

          {/* ================= STATS CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">

            <div className="bg-white rounded-2xl shadow-2xl p-5 transition hover:scale-105">
              <p className="text-sm text-[#1679AB]">Active Students</p>
              <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                {activeStudentsCount}
              </h2>
              <p className="text-xs mt-1 text-green-500">Currently active students</p>
              <div className="h-10 rounded mt-4 bg-[#D1F7DC]"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-5 transition hover:scale-105">
              <p className="text-sm text-[#1679AB]">Active Courses</p>
              <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                {activeCoursesCount}
              </h2>
              <p className="text-xs mt-1 text-green-500">Currently running courses</p>
              <div className="h-10 rounded mt-4 bg-[#FDE2E2]"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-5 transition hover:scale-105">
              <p className="text-sm text-[#1679AB]">Active mentors</p>
              <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                {activeMentorsCount} {/* ✅ DYNAMIC */}
              </h2>
              <p className="text-xs mt-1 text-green-500">Currently active mentors</p>
              <div className="h-10 rounded mt-4 bg-[#FFE7D1]"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-5 transition hover:scale-105">
              <p className="text-sm text-[#1679AB]">Active</p>
              <h2 className="text-3xl font-bold text-[#141E46] mt-2">
                {activeMentorsCount}
              </h2>
              <p className="text-xs mt-1 text-green-500">Currently active mentors</p>
              <div className="h-10 rounded mt-4 bg-[#FFE7D1]"></div>
            </div>

          </div>

          {/* ================= BOTTOM SECTION ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            <div className="space-y-4 flex flex-col justify-between order-1 md:order-3">
              <div className="h-[140px] bg-white rounded-2xl shadow-2xl p-4">
                <p className="text-sm text-[#1679AB]">
                  Total Students Working Hours
                </p>
                <p className="text-lg font-semibold text-[#141E46]">
                  00 Hr 00 Min 00 Sec
                </p>
              </div>

              <div className="h-[140px] bg-white rounded-2xl shadow-2xl p-4">
                <p className="text-sm text-[#1679AB]">
                  Total Students Break Hours
                </p>
                <p className="text-lg font-semibold text-[#141E46]">
                  00 Hr 00 Min 55 Sec
                </p>
              </div>
            </div>

            <div className="order-2 md:order-1 transition hover:scale-105">
              <DashboardCalendar />
            </div>

            <div className="h-80 bg-blue-50 rounded-2xl shadow-2xl flex justify-center items-center order-3 md:order-2 transition hover:scale-105">
              <LiveClockUpdate />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Admindashboard;
