import { useState } from "react";
import { FaBell, FaSearch, FaMapMarkerAlt, FaTimes } from "react-icons/fa";

function StudentTopbar({ onLocationSave }) {
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false); // Added state for map modal

  // Institution coordinates - Aviv Digital Academy
  const INSTITUTION_LAT = 11.278746549272379;
  const INSTITUTION_LNG = 75.77908191030914;
  const MAX_DISTANCE = 5; // 5 meters only

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

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
        const accuracy = pos.coords.accuracy;

        // Calculate distance from institution
        const distance = calculateDistance(
          latitude,
          longitude,
          INSTITUTION_LAT,
          INSTITUTION_LNG
        );

        console.log("Current Location:", { latitude, longitude });
        console.log("Institution Location:", { lat: INSTITUTION_LAT, lng: INSTITUTION_LNG });
        console.log("Distance:", distance, "meters");
        console.log("GPS Accuracy:", accuracy, "meters");

        // Check if within 5 meters
        if (distance > MAX_DISTANCE) {
          const distanceInKm = (distance / 100).toFixed(2);
          alert(
            `❌ Location Save Denied\n\n` +
            `You are ${Math.round(distance)} meters (${distanceInKm} km) away from Aviv Digital Academy.\n\n` +
            `You must be within ${MAX_DISTANCE} meters of the institution to save location.\n\n` +
            `Please come closer to the institution premises.`
          );
          setIsSavingLocation(false);
          return;
        }

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
            body: JSON.stringify({ 
              latitude, 
              longitude,
              distance,
              accuracy
            }),
          });
          
          const data = await res.json();

          if (!res.ok) {
            alert("Error: " + data.message);
            setIsSavingLocation(false);
            return;
          }

          alert(
            `✅ Location saved successfully!\n\n` +
            `Latitude: ${latitude.toFixed(6)}\n` +
            `Longitude: ${longitude.toFixed(6)}\n` +
            `Distance from institution: ${Math.round(distance)}m\n` +
            `GPS Accuracy: ±${Math.round(accuracy)}m`
          );
          
          if (onLocationSave) onLocationSave();
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
            errorMessage = "Location information unavailable. Try moving outdoors or near a window.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location.";
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const toggleMapModal = () => {
    setShowMapModal(!showMapModal);
  };

  return (
    <>
      <div className="h-16 w-full bg-[#EEF6FB] border-b border-[#1679AB] flex items-center justify-between px-6">
        <h2 className="font-[Montserrat] text-xl font-semibold text-[#141E46]">
          Dashboard
        </h2>

        <div className="hidden md:flex items-center bg-white border border-[#1679AB] rounded-lg px-3 py-2 w-1/3">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-6">
          {/* 📍 Location - Opens Map Modal */}
          <div
            onClick={toggleMapModal}
            className="cursor-pointer text-[#1679AB] hover:text-[#141E46] transition-colors"
            title="View Institution Location"
          >
            <FaMapMarkerAlt size={20} />
          </div>

          <div className="relative cursor-pointer">
            <FaBell className="text-[#1679AB]" size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={toggleMapModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1679AB]">
              <h3 className="text-xl font-semibold text-[#141E46]">
                Aviv Digital Academy Location
              </h3>
              <button
                onClick={toggleMapModal}
                className="text-gray-500 hover:text-[#141E46] transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Body - Google Maps Iframe */}
            <div className="p-4">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d488.8253478741679!2d75.77882836155267!3d11.278746549272383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTHCsDE2JzQzLjUiTiA3NcKwNDYnNDQuNyJF!5e0!3m2!1sen!2sin!4v1737029715743!5m2!1sen!2sin"
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Aviv Digital Academy Location"
                ></iframe>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <a
                href="https://maps.app.goo.gl/uCAETrGA2yTEmEDz9?g_st=aw"  // Updated to the new link
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1679AB] hover:text-[#141E46] font-semibold underline"
              >
                Open in Google Maps
              </a>
              <button
                onClick={toggleMapModal}
                className="bg-[#1679AB] hover:bg-[#141E46] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

export default StudentTopbar;