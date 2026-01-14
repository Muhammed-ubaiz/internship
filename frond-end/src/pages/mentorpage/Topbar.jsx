import React from "react";
import { FaSearch, FaBell, FaMapMarkerAlt } from "react-icons/fa";

function Topbar() {
  return (
    <div className="w-full font- border-b border-[#1679AB] px-4 py-5">
      <div className="flex items-center justify-between gap-6">
        
        {/* LEFT */}
        <h1 className="text-2xl font-[Montserrat] font-semibold text-[#141E46]">
          Dashboard
        </h1>

      

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
