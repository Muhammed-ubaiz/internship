import React from "react";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";

function Topbar() {
  return (
    <div className="h-16 w-full bg-[#EEF6FB] border-b border-[#1679AB] 
                    flex items-center justify-between px-6">

      {/* App Name */}
      <h2 className="text-xl font-semibold text-[#141E46]">
        Dashboard
      </h2>

      {/* Search */}
      <div className="hidden md:flex items-center bg-white border border-[#1679AB] rounded-lg px-3 py-2 w-1/3">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full outline-none text-sm"
        />
      </div>   

      {/* Icons */}
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <FaBell className="text-[#1679AB]" size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* <div className="flex items-center gap-2 cursor-pointer">
          <FaUserCircle size={32} className="text-[#1679AB]" />
          <div className="text-sm">
            <p className="font-semibold text-[#141E46]">Admin</p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Topbar;
