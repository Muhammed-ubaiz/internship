import React, { useState } from "react";
import { FaBell, FaSearch, FaMapMarkerAlt, FaTimes } from "react-icons/fa";

function Topbar() {
  const [showMapModal, setShowMapModal] = useState(false);

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

  const toggleMapModal = () => {
    setShowMapModal(!showMapModal);
  };

  return (
    <>
   <div className="h-16 w-full bg-[#EEF6FB] border-b border-[#1679AB] flex items-center justify-between px-6">
  
  <h2 className="font-[Montserrat] text-xl font-semibold text-[#141E46]
                 text-center w-full md:w-auto md:text-left">
    Dashboard
  </h2>



        
        <div className="flex items-center gap-6">
       
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

  
      {showMapModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={toggleMapModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
      
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

           
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <a
                href="https://maps.app.goo.gl/pVGovdtuynCpghqY6"
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

    </>
  );
}

export default Topbar;