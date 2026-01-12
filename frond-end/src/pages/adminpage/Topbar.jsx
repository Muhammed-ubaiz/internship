import axios from "axios";
import React from "react";
import { FaBell, FaSearch, FaMapMarkerAlt } from "react-icons/fa";

function Topbar() {

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
navigator.geolocation.getCurrentPosition(
  async (pos) => {
    const latitude = pos.coords.latitude;
    const longitude = pos.coords.longitude;

    try {
      const res = await fetch("http://localhost:3001/admin/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + data.message);
        return;
      }

      alert(data.message); // Location saved successfully
    } catch (err) {
      alert("Error saving location: " + err.message);
    }
  },
  () => alert("Location permission denied")
);

  };

  return (
    <div className="h-16 w-full bg-[#EEF6FB] border-b border-[#1679AB]
                    flex items-center justify-between px-6">

      {/* App Name */}
      <h2 className=" font-[Montserrat] text-xl font-semibold text-[#141E46] ">
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

        {/* 📍 Location */}
        <div
          onClick={getLocation}
          className="cursor-pointer text-[#1679AB] hover:text-[#141E46]"
          title="Save Location"
        >
          <FaMapMarkerAlt size={20} />
        </div>

        {/* 🔔 Notification */}
        <div className="relative cursor-pointer">
          <FaBell className="text-[#1679AB]" size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

      </div>
    </div>
  );
}

export default Topbar;
