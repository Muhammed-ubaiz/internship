import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaUmbrellaBeach,
  FaPowerOff,
  FaChevronDown,
} from "react-icons/fa";

function SideBarStudent() {
  const navigate = useNavigate();

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const menuItem =
    "flex items-center justify-between px-6 py-3 text-sm text-white hover:bg-white hover:text-black cursor-pointer transition-all";

  const subItem =
    "pl-12 py-2 text-xs text-gray-400 hover:text-black hover:bg-white cursor-pointer transition-all";

  return (
    <div className="fixed left-0 top-0 h-screen w-[220px] bg-[#141E46]/90 flex flex-col">

      {/* Title */}
      <div className="px-6 py-5 text-white font-bold text-lg border-b border-gray-700">
        Student Panel
      </div>

      {/* Menu */}
      <div className="flex flex-col flex-1 mt-2">

        {/* Dashboard */}
        <div
          className={menuItem}
          onClick={() => navigate()}
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
            className={`transition-transform ${
              attendanceOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {attendanceOpen && (
          <div>
            <div
              className={subItem}
              onClick={() => navigate()}
            >
              Daily Attendance
            </div>
            <div
              className={subItem}
              onClick={() => navigate()}
            >
              Monthly Summary
            </div>
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
              onClick={() => navigate()}
            >
              Apply Leave
            </div>
            <div
              className={subItem}
              onClick={() => navigate()}
            >
              Leave History
            </div>
          </div>
        )}

        {/* Push Logout to Bottom */}
        <div className="mt-auto border-t border-gray-700">
          <div className={menuItem}>
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

export default SideBarStudent;
