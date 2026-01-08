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

  const menuItem =
    "flex items-center justify-between px-6 py-3 text-sm text-white hover:bg-white hover:text-black cursor-pointer transition-all";

  const subItem =
    "pl-12 py-2 text-xs text-gray-300 hover:text-black hover:bg-white cursor-pointer transition-all";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-[#141E46]/90 px-4 py-3 text-white">
        <h2 className="font-bold">Student Panel</h2>
        <button onClick={() => setSidebarOpen(true)}>
          <FaBars size={22} />
        </button>
      </div>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div

          className={menuItem}
          onClick={() => navigate("/studentDashboard")}
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
              onClick={() => navigate("/studentDailyAttendance")}
            >
              Daily Attendance

          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-[220px] bg-[#141E46]/90 flex flex-col z-50
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {/* Title */}
        <div className="px-6 py-5 text-white font-bold text-lg border-b border-gray-700 flex justify-between items-center">
          Student Panel
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* Menu */}
        <div className="flex flex-col flex-1 mt-2">

          {/* Dashboard */}
          <div
            className={menuItem}
            onClick={() => {
              navigate("/studentsdashboard");
              setSidebarOpen(false);
            }}
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
                onClick={() => setSidebarOpen(false)}
              >
                Daily Attendance
              </div>
              <div
                className={subItem}
                onClick={() => {
                  navigate("/studentMonthlySummary");
                  setSidebarOpen(false);
                }}
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

l
        {leaveOpen && (
          <div>
            <div
              className={subItem}
              onClick={() => navigate("/LeaveApply")}
            >
              Apply Leave

          {leaveOpen && (
            <div>
              <div
                className={subItem}
                onClick={() => setSidebarOpen(false)}
              >
                Apply Leave
              </div>
              <div
                className={subItem}
                onClick={() => setSidebarOpen(false)}
              >
                Leave History
              </div>

            </div>
          )}

          {/* Logout */}
          <div className="mt-auto border-t border-gray-700">
            <div

              className={subItem}
              onClick={() => navigate("/StudentLeaveHistory")}
            >
              Leave History
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="mt-auto border-t border-gray-700">
          <div
            className={menuItem}
            onClick={() => navigate("/studentlogin")}
          >
            <div className="flex items-center gap-3">
              <FaPowerOff />
              <span>Logout</span>

              className={menuItem}
              onClick={() => navigate("/studentlogin")}
            >
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
