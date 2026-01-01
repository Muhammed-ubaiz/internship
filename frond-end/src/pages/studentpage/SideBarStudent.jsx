import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaUmbrellaBeach,
  FaCalendarAlt,
  FaPowerOff,
} from "react-icons/fa";

function SideBarStudent() {
  const navigate = useNavigate();

  const menuItem =
    "relative group flex items-center justify-center mb-11 mt-7 cursor-pointer transform transition-transform duration-300 hover:scale-125";

  const tooltip =
    "absolute left-3 top-11 -translate-y-1/2 bg-gray-200/80 text-[#141E46] font-bold text-xs px-1 py-1 rounded-md opacity-0 scale-80 translate-x-1 group-hover:opacity-100 group-hover:scale-70 group-hover:translate-x-0 transition-all duration-300";

  return (
    <div className="fixed left-0 top-0 h-screen w-[150px] flex flex-col items-center pt-10 ">

      {/* Dashboard */}
      <div className={menuItem} >
        <FaHome size={30} />
        <span className={tooltip}>Dashboard</span>
      </div>

      {/* Attendance */}
      <div className={menuItem} >
        <FaCalendarCheck size={30} />
        <span className={tooltip}>Attendance</span>
      </div>

      {/* Leave */}
      <div className={menuItem} >
        <FaUmbrellaBeach size={30} />
        <span className={tooltip}>Leave</span>
      </div>

      {/* Holiday */}
      <div className={menuItem} >
        <FaCalendarAlt size={30} />
        <span className={tooltip}>Holiday</span>
      </div>

    {/* Logout (bottom) */}
<div className="mt-auto mb-8">
  <div className={menuItem}>
    <FaPowerOff size={30} />
    <span className={tooltip}>Logout</span>
  </div>
</div>

    </div>
  );
}

export default SideBarStudent;
