import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaUmbrellaBeach,
  FaPowerOff,
  FaChevronDown,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function SideBarStudent() {
  const navigate = useNavigate();

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.replace("/");
  };


  const closeSidebar = () => {
    setSidebarOpen(false);
  };


  const handleNavigation = (path) => {
    navigate(path);
    closeSidebar();
  };

  const menuItem =
    "flex items-center justify-between px-6 py-3 text-sm text-white hover:bg-[#EEF6FB] hover:text-black cursor-pointer transition-all rounded-lg mx-2";

  const subItem =
    "pl-12 py-2 text-xs text-gray-300 hover:text-black hover:bg-white cursor-pointer transition-all rounded-lg mx-2";

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}

        className="lg:hidden fixed top-2 left-2 z-50 bg-[#141E46] text-white p-3 rounded-lg shadow-lg hover:bg-[#1a2858] transition-all"

      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>


      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`

          fixed left-0 top-0 h-screen w-[220px] bg-[#141E46]/95 backdrop-blur-sm flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo/Title */}

        <div className="text-white font-bold text-lg border-b border-gray-700 p-2">
          <img
            src="https://res.cloudinary.com/daadrhhk9/image/upload/v1768208933/36F737FD-D312-4078-9846-4B9C9B266231_1_201_a_1_kuzwta.png"
            alt="Student Panel Logo"

            className="w-full h-auto"

          />
        </div>

        {/* Menu */}
        <div className="flex flex-col flex-1 mt-2 overflow-y-auto">

          {/* Dashboard */}
          <div
            className={menuItem}
            onClick={() => handleNavigation("/studentsdashboard")}
          >
            <div className="flex items-center gap-3">
              <FaHome />
              <span>Dashboard</span>
            </div>
          </div>

          {/* Attendance */}
          <div
            className={menuItem}
            onClick={() => setAttendanceOpen(!attendanceOpen)}
          >
            <div className="flex items-center gap-3">
              <FaCalendarCheck />
              <span>Attendance</span>
            </div>
            <FaChevronDown
              className={`transition-transform duration-300 ${
                attendanceOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {attendanceOpen && (
            <div className="mb-1">
              <div
                className={subItem}

                onClick={() => handleNavigation("/DailyAttendance")}

              >
                Daily Attendance
              </div>
              <div
                className={subItem}
                onClick={() => handleNavigation("/studentMonthlySummary")}
              >
                Monthly Summary
              </div>
            </div>
          )}

          {/* Leave */}
          <div className={menuItem} onClick={() => setLeaveOpen(!leaveOpen)}>
            <div className="flex items-center gap-3">
              <FaUmbrellaBeach />
              <span>Leave</span>
            </div>
            <FaChevronDown
              className={`transition-transform duration-300 ${
                leaveOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {leaveOpen && (
            <div className="mb-1">
              <div
                className={subItem}
                onClick={() => handleNavigation("/LeaveApply")}
              >
                Apply Leave
              </div>
              <div
                className={subItem}
                onClick={() => handleNavigation("/StudentLeaveHistory")}
              >
                Leave History
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="mt-auto border-t border-gray-700 pt-2">
            <div className={menuItem} onClick={handleLogout}>
              <div className="flex items-center gap-3">
                <FaPowerOff />
                <span>Logout</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default SideBarStudent;