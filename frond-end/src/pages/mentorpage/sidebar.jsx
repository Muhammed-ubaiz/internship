import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaUmbrellaBeach,
  FaBook,
  FaPowerOff,
  FaChevronDown,
  FaUsers,
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();

  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.replace("/mentorlogin");
  };

  const menuItem =
    "flex items-center justify-between px-6 py-3 text-sm text-white hover:bg-[#EEF6FB] hover:text-black cursor-pointer transition-all";

  const subItem =
    "pl-12 py-2 text-xs text-gray-300 hover:text-black hover:bg-white cursor-pointer transition-all";

  return (
    <div className="fixed left-0 top-0 h-screen w-[220px] bg-[#141E46]/90 flex flex-col">

      {/* LOGO */}
      <div className="border-b border-gray-700 p-4">
        <img
          src="https://res.cloudinary.com/daadrhhk9/image/upload/v1768208933/36F737FD-D312-4078-9846-4B9C9B266231_1_201_a_1_kuzwta.png"
          alt="logo"
        />
      </div>

      {/* MENU */}
      <div className="flex flex-col flex-1 mt-2">

        {/* Dashboard */}
        <div className={menuItem} onClick={() => navigate("/mentordashboard")}>
          <div className="flex items-center gap-3">
            <FaHome />
            <span>Dashboard</span>
          </div>
        </div>

       
        {/* My Students */}
        <div className={menuItem} onClick={() => navigate("/mystudents")}>
          <div className="flex items-center gap-3">
            <FaUsers />
            <span>My Students</span>
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
            className={`transition-transform ${
              attendanceOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {attendanceOpen && (
          <div>
            <div
              className={subItem}
              onClick={() => navigate("/dailyattendance1")}
            >
              Daily Attendance
            </div>
            <div
              className={subItem}
              onClick={() => navigate("/monthlysummary1")}
            >
              Monthly Summary
            </div>
          </div>
        )}

        {/* Leave History */}
        <div
          className={menuItem}
          onClick={() => navigate("/leavehistory1")}
        >
          <div className="flex items-center gap-3">
            <FaUmbrellaBeach />
            <span>Leave History</span>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-auto border-t border-gray-700">
          <div className={menuItem} onClick={handleLogout}>
            <div className="flex items-center gap-3">
              <FaPowerOff />
              <span>Logout</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Sidebar;
