import React, { useState } from 'react';
import { FaBell, FaSearch, FaMapMarkerAlt } from "react-icons/fa";

function StudentTopbar() {
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    setIsSavingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        try {
          const token = localStorage.getItem("token");
          const role = localStorage.getItem("role");

          const res = await fetch("http://localhost:3001/student/location", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "role": role
            },
            body: JSON.stringify({ latitude, longitude }),
          });
          
          const data = await res.json();

          if (!res.ok) {
            alert("Error: " + data.message);
            return;
          }

          alert(`Location saved successfully!\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`);
        } catch (err) {
          alert("Error saving location: " + err.message);
        } finally {
          setIsSavingLocation(false);
        }
      },
      (error) => {
        setIsSavingLocation(false);
        
        let errorMessage = "Location permission denied";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location.";
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <>
      <div className="h-16 w-full bg-[#EEF6FB] border-b border-[#1679AB] flex items-center justify-between px-6">
        {/* App Name */}
        <h2 className="font-[Montserrat] text-xl font-semibold text-[#141E46]">
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
            className={`cursor-pointer ${
              isSavingLocation 
                ? 'text-gray-400 cursor-wait' 
                : 'text-[#1679AB] hover:text-[#141E46]'
            } transition-colors`}
            title={isSavingLocation ? "Saving location..." : "Save Current Location"}
          >
            <FaMapMarkerAlt 
              size={20} 
              className={isSavingLocation ? 'animate-pulse' : ''}
            />
          </div>

          {/* 🔔 Notification */}
          <div className="relative cursor-pointer">
            <FaBell className="text-[#1679AB]" size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentTopbar;