import React from "react";
import {
  FaHome,
  FaCalendarCheck,
  FaUmbrellaBeach,
  FaUserClock,
  FaPowerOff,
} from "react-icons/fa";

function Sidebar() {
  return (
    <>
      {/* Sidebar Container */}
      <div className="h-screen w-64 fixed left-0 top-0 bg-[#EEF6FB] text-[#141E46] shadow-2xl">

        {/* Header */}
        <div className="p-1 text-center border-b border-[#1679AB]">
          <h1 className="text-2xl font-bold text-[#1679AB]">
            ADMIN PANEL
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Attendance System
          </p>
        </div>

        {/* Menu */}
        <ul className="mt-6 px-4 space-y-3">

          <li className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer 
                         hover:bg-[#1679AB] hover:text-white transition">
            <FaHome />
            <span className="font-medium">Dashboard</span>
          </li>

          <li className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer 
                         hover:bg-[#1679AB] hover:text-white transition">
            <FaCalendarCheck />
            <span className="font-medium">Attendance</span>
          </li>

          <li className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer 
                         hover:bg-[#1679AB] hover:text-white transition">
            <FaUmbrellaBeach />
            <span className="font-medium">Holidays</span>
          </li>

          <li className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer 
                         hover:bg-[#1679AB] hover:text-white transition">
            <FaUserClock />
            <span className="font-medium">Leave</span>
          </li>

        </ul>

        {/* Logout */}
        <div className="absolute bottom-6 w-full px-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer 
                          bg-[#141E46] text-white hover:bg-[#2e3656] transition">
            <FaPowerOff />
            <span className="font-medium">Logout</span>
          </div>
        </div>

      </div>
    </>
  );
}

export default Sidebar;
