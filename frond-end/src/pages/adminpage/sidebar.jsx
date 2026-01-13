import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaUmbrellaBeach,
  FaUserClock,
  FaBook,
  FaPowerOff,
  FaChevronDown,
  FaElementor,
  FaUsers,
} from "react-icons/fa";

function Sidebar() {
  const navigate = useNavigate();

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  
    window.location.replace("/adminlogin"); 
  };
  

  const menuItem =
    "flex items-center justify-between px-6 py-3 text-sm text-white hover:bg-[#EEF6FB] hover:text-black cursor-pointer transition-all";

  const subItem =
    "pl-12 py-2 text-xs text-gray-300 hover:text-black hover:bg-white cursor-pointer transition-all";

  return (
    <div className="fixed left-0 top-0 h-screen w-[220px] bg-[#141E46]/90 flex flex-col ">

      {/* Title */}
      <div className=" text-white font-bold text-lg  border-b border-gray-700">
        <img src="https://res.cloudinary.com/daadrhhk9/image/upload/v1768208933/36F737FD-D312-4078-9846-4B9C9B266231_1_201_a_1_kuzwta.png" alt="" />
      </div>

      {/* Menu */}
      <div className="flex flex-col flex-1 mt-2">

        {/* Dashboard */}
        <div className={menuItem} onClick={() => navigate("/admindashboard")}>
          <div className="flex items-center gap-3">
            <FaHome />
            <span>Dashboard</span>
          </div>
        </div>

         {/* Courses */}
         <div className={menuItem} onClick={() => navigate("/course")}>
          <div className="flex items-center gap-3">
            <FaBook />
            <span>Courses</span>
          </div>
        </div>

        <div className={menuItem} onClick={() => navigate("/mentorcreate")}>
          <div className="flex items-center gap-3">
            <FaUserClock />
            <span>Mentors</span>
          </div>
        </div>
        
          {/* Students */}
        <div className={menuItem} onClick={() => navigate("/student")}>
          <div className="flex items-center gap-3">
            <FaUsers />
            <span>Students</span>
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
              onClick={() => navigate("/attendance")}
            >
              Daily Attendance
            </div>
            <Link to ="/monthlySummary">
            <div
              className={subItem}
              onClick={() => navigate("/attendance/monthly")}
            >
              Monthly Summary
            </div>
            </Link>
          </div>
        )}

        {/* Leave */}
        <div
          className={menuItem}
          onClick={() => setLeaveOpen(!leaveOpen)}
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
              onClick={() => navigate("/adminLeaveRequest")}
            >
               Leave Request's
            </div>
            <div
              className={subItem}
              onClick={() => navigate("/leaveHistory")}
            >
              Leave History
            </div>
          </div>
        )}

      
        {/* Logout */}
        <div className="mt-auto border-t border-gray-700">
          <div
            className={menuItem}
            onClick={handleLogout}

          >
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
