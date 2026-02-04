import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaUmbrellaBeach,
  FaPowerOff,
  FaChevronDown,
  FaUsers,
  FaMicrophone,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.replace("/mentorlogin");
  };

  const menuItem =
    "flex items-center justify-between px-6 py-3 text-sm text-white hover:bg-[#EEF6FB] hover:text-black cursor-pointer transition-all";

  const subItem =
    "pl-12 py-2 text-xs text-gray-300 hover:text-black hover:bg-white cursor-pointer transition-all";

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-2 left-2 z-50 lg:hidden bg-[#141E46] text-white p-3 rounded-lg shadow"
      >
        {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-[220px] bg-[#141E46] z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="border-b border-gray-700 p-4">
          <img
            src="https://res.cloudinary.com/daadrhhk9/image/upload/v1768208933/36F737FD-D312-4078-9846-4B9C9B266231_1_201_a_1_kuzwta.png"
            alt="logo"
            className="w-full"
          />
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto mt-2">
          {/* Dashboard */}
          <div
            className={menuItem}
            onClick={() => handleNavigation("/mentordashboard")}
          >
            <div className="flex items-center gap-3">
              <FaHome />
              <span>Dashboard</span>
            </div>
          </div>

          {/* My Students */}
          <div
            className={menuItem}
            onClick={() => handleNavigation("/mystudents")}
          >
            <div className="flex items-center gap-3">
              <FaUsers />
              <span>My Students</span>
            </div>
          </div>

          {/* Attendance */}
          <div
            className={menuItem}
            onClick={() => {
              setAttendanceOpen(!attendanceOpen);
              setLeaveOpen(false);
            }}
          >
            <div className="flex items-center gap-3">
              <FaCalendarCheck />
              <span>Attendance</span>
            </div>
            <FaChevronDown
              className={`transition-transform ${
                attendanceOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {attendanceOpen && (
            <div>
              <div
                className={subItem}
                onClick={() => handleNavigation("/punchinrequest")}
              >
                Punch In Request
              </div>
              <div
                className={subItem}
                onClick={() => handleNavigation("/dailyattendance1")}
              >
                Daily Attendance
              </div>
              <div
                className={subItem}
                onClick={() => handleNavigation("/monthlysummary1")}
              >
                Monthly Summary
              </div>
            </div>
          )}

          {/* Announcement */}
          <div
            className={menuItem}
            onClick={() => handleNavigation("/announcement")}
          >
            <div className="flex items-center gap-3">
              <FaMicrophone />
              <span>Announcement</span>
            </div>
          </div>

          {/* Leave */}
          <div
            className={menuItem}
            onClick={() => {
              setLeaveOpen(!leaveOpen);
              setAttendanceOpen(false);
            }}
          >
            <div className="flex items-center gap-3">
              <FaUmbrellaBeach />
              <span>Leave</span>
            </div>
            <FaChevronDown
              className={`transition-transform ${
                leaveOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {leaveOpen && (
            <div>
              <div
                className={subItem}
                onClick={() => handleNavigation("/mentorleaverequest")}
              >
                Leave Requests
              </div>
              <div
                className={subItem}
                onClick={() => handleNavigation("/leavehistory1")}
              >
                Leave History
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="border-t border-gray-700">
          <div className={menuItem} onClick={handleLogout}>
            <div className="flex items-center gap-3">
              <FaPowerOff />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
