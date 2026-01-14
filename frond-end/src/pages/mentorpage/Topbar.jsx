import React from "react";
import { FaSearch, FaBell, FaMapMarkerAlt } from "react-icons/fa";

function Topbar() {
  return (
    <div className="w-full bg-[#F3FAFF] border-b border-[#1679AB] px-4 py-5">
      <div className="flex items-center justify-between gap-6">
        
        {/* LEFT */}
        <h1 className="text-2xl font-semibold text-[#141E46]">
          Dashboard
        </h1>

        {/* CENTER */}
        <div className="flex items-center bg-white border border-[#1679AB] rounded-xl px-5 py-2.5 w-full max-w-xl">
          <FaSearch className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full outline-none text-sm text-gray-600"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-7">
          <FaMapMarkerAlt className="text-xl text-[#1679AB]" />

          <div className="relative">
            <FaBell className="text-xl text-[#1679AB]" />
            <span className="absolute -top-2 -right-2 bg-red-500 h-2.5 w-2.5 rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
