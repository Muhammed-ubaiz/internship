import React from "react";
import { FaSearch, FaBell, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // import for navigation

function Topbar() {
  const navigate = useNavigate(); // initialize navigate

  const handleBellClick = () => {
    // navigate to notifications page (change path as needed)
    navigate("/mentornotification");
  };

  return (
    <div className="w-full border-b border-[#1679AB] px-4 py-5 font-[Montserrat]">
      <div className="flex items-center justify-between gap-6">
        {/* LEFT */}
        <h1 className="text-2xl font-semibold text-[#141E46]">
          Dashboard
        </h1>

        {/* RIGHT */}
        <div className="flex items-center gap-7">
          <FaMapMarkerAlt className="text-xl text-[#1679AB]" />

          {/* Bell Button */}
          <button 
            onClick={handleBellClick} 
            className="relative focus:outline-none"
            aria-label="Notifications"
          >
            <FaBell className="text-xl text-[#1679AB]" />
            <span className="absolute -top-2 -right-2 bg-red-500 h-2.5 w-2.5 rounded-full"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
