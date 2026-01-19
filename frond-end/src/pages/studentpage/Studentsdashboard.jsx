import { useState, useEffect } from "react";
import LiveClockUpdate from "../LiveClockUpdate";
import DashboardCalendar from "../Dashboardcalender";
import SideBarStudent from "./SideBarStudent";
import StudentTopbar from "./StudentTopbar";
import axios from "axios";

// Enhanced Map Modal Component
function MapModal({
  isOpen,
  onClose,
  userLocation,
  institutionLocation,
  distance,
  onConfirm,
  isLoading,
}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(userLocation);

  // Load Leaflet once
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    // Check if CSS is already loaded
    if (!document.querySelector('link[href*="leaflet"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      css.crossOrigin = "";
      document.head.appendChild(css);
    }

    // Check if JS is already loaded
    if (!document.querySelector('script[src*="leaflet"]')) {
      const js = document.createElement("script");
      js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      js.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      js.crossOrigin = "";
      js.onload = () => {
        setMapLoaded(true);
      };
      document.body.appendChild(js);
    } else {
      setMapLoaded(true);
    }

    return () => {
      // Don't clean up Leaflet globally
    };
  }, []);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen || !mapLoaded || !userLocation) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanupMap();
    };
  }, [isOpen, mapLoaded, userLocation?.latitude, userLocation?.longitude]);

  const initMap = () => {
    // Check if map container exists
    const mapContainer = document.getElementById('punchMap');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    // Clear any existing map
    if (mapInstance) {
      mapInstance.remove();
    }

    // Check if Leaflet is loaded
    if (!window.L) {
      console.error('Leaflet not loaded');
      return;
    }

    try {
      // Create map with options
      const map = window.L.map('punchMap', {
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
      });

      // Set view to user location
      map.setView([userLocation.latitude, userLocation.longitude], 17);

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        detectRetina: true
      }).addTo(map);

      // Add user marker with custom icon
      const userIcon = window.L.divIcon({
        html: `<div style="
          background: #1679AB;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        ">📍</div>`,
        className: 'custom-user-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = window.L.marker(
        [userLocation.latitude, userLocation.longitude],
        { icon: userIcon }
      ).addTo(map);

      marker.bindPopup('<b>Your Location</b><br>Move to get accurate GPS').openPopup();
      setUserMarker(marker);

      // Add institution marker with custom icon
      const institutionIcon = window.L.divIcon({
        html: `<div style="
          background: #0dd635;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">🏫</div>`,
        className: 'custom-institution-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      window.L.marker(
        [institutionLocation.lat, institutionLocation.lng],
        { icon: institutionIcon }
      ).addTo(map)
      .bindPopup('<b>Institution</b><br>Destination location');

      // Add range circle
      window.L.circle(
        [institutionLocation.lat, institutionLocation.lng],
        {
          radius: 100,
          color: distance <= 100 ? "#0dd635" : "#ed1717",
          fillColor: distance <= 100 ? "#0dd635" : "#ed1717",
          fillOpacity: 0.2,
          weight: 2,
          dashArray: distance <= 100 ? null : '5, 5'
        }
      ).addTo(map);

      // Add connecting line
      const line = window.L.polyline([
        [userLocation.latitude, userLocation.longitude],
        [institutionLocation.lat, institutionLocation.lng]
      ], {
        color: '#1679AB',
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 10'
      }).addTo(map);

      // Store map instance and references
      map._line = line;
      setMapInstance(map);

      // Start GPS tracking
      startGPSTracking(map, marker);

      // Invalidate size after a short delay
      setTimeout(() => {
        map.invalidateSize();
      }, 300);

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const startGPSTracking = (map, marker) => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Update current location
        const newLocation = { latitude, longitude };
        setCurrentLocation(newLocation);

        // Move marker smoothly
        marker.setLatLng([latitude, longitude]);
        
        // Update connecting line
        if (map._line) {
          map._line.setLatLngs([
            [latitude, longitude],
            [institutionLocation.lat, institutionLocation.lng]
          ]);
        }

        // Show accuracy circle
        if (map._accuracyCircle) {
          map.removeLayer(map._accuracyCircle);
        }
        
        const accuracyCircle = window.L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#1679AB',
          fillColor: '#1679AB',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '5, 5'
        }).addTo(map);
        
        map._accuracyCircle = accuracyCircle;

        // Auto-center if accuracy is good
        if (accuracy < 50) {
          map.setView([latitude, longitude], 17, {
            animate: true,
            duration: 1
          });
        }

        // Update marker popup with accuracy info
        marker.setPopupContent(`
          <b>Your Location</b><br>
          Accuracy: ${Math.round(accuracy)} meters<br>
          <small>${accuracy < 30 ? '✅ Good accuracy' : '⏳ Refining...'}</small>
        `);

      },
      (error) => {
        console.error('GPS Error:', error);
        marker.setPopupContent(`
          <b>Your Location</b><br>
          <small style="color: red;">⚠ GPS Error: ${error.message}</small>
        `);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    // Store watch ID for cleanup
    map._gpsWatchId = watchId;
  };

  const cleanupMap = () => {
    if (mapInstance) {
      // Stop GPS tracking
      if (mapInstance._gpsWatchId) {
        navigator.geolocation.clearWatch(mapInstance._gpsWatchId);
      }
      
      // Remove map
      mapInstance.remove();
      setMapInstance(null);
      setUserMarker(null);
    }
  };

  // Handle resize
  useEffect(() => {
    if (!mapInstance || !isOpen) return;

    const handleResize = () => {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapInstance, isOpen]);

  if (!isOpen) return null;

  const inRange = distance <= 50;

 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden animate-scaleIn">
        {/* Minimal Header */}
        <div className="bg-gray-600 text-white px-4 py-2.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Location</h2>
            <p className="text-[11px] text-blue-100 opacity-80">
              100m range check
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded p-1 transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* Minimal Distance Info */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">
              Distance: <span className="text-gray-900">{Math.round(distance)}m</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              inRange ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {inRange ? "In Range" : "Out of Range"}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-1.5 text-[11px]">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1679AB]"></div>
              <span className="text-gray-600">Your location</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0dd635]"></div>
              <span className="text-gray-600">Institution</span>
            </div>
          </div>
        </div>

        {/* Minimal Map */}
        <div className="relative">
          <div 
            id="punchMap" 
            className="h-[300px] w-full"
          />
          
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 rounded-full border-2 border-[#1679AB] border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Minimal Status */}
        <div className="px-4 py-1.5 bg-blue-50 border-t">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                currentLocation ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-gray-700">
                {currentLocation ? 'GPS active' : 'GPS connecting...'}
              </span>
            </div>
            {!inRange && (
              <span className="text-red-600 text-xs">⚠ Move closer</span>
            )}
          </div>
        </div>

        {/* Minimal Buttons */}
        <div className="px-4 py-2.5 flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-700 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(currentLocation || userLocation)}
            disabled={!inRange || isLoading}
            className={`flex-1 py-2 rounded-lg font-medium text-white text-sm ${
              !inRange
                ? "bg-gray-300 text-gray-500"
                : "bg-gradient-to-r from-[#0dd635] to-[#0aa82a] hover:opacity-90"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                Checking...
              </span>
            ) : "Confirm"}
          </button>
        </div>
      </div>

      <style>{`
        .animate-scaleIn {
          animation: scaleIn 0.15s ease-out;
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </div>
  );;
}

function Studentsdashboard() {
  const [loading, setLoading] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [workingHours, setWorkingHours] = useState("00 Hr 00 Mins 00 Secs");
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [liveWorkingTime, setLiveWorkingTime] = useState("00 Hr 00 Mins 00 Secs");

  // Break timer states
  const [breakTime, setBreakTime] = useState(0);
  const [liveBreakTime, setLiveBreakTime] = useState("00 Hr 00 Mins 00 Secs");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);

  // Total accumulated working time
  const [totalWorkingTime, setTotalWorkingTime] = useState(0);

  // Map modal states
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);

  const INSTITUTION_LAT = 11.280610467307952;
  const INSTITUTION_LNG = 75.77045696982046;
  const MAX_DISTANCE = 50;

  useEffect(() => {
    const loadTodayAttendance = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      try {
        const res = await axios.get("http://localhost:3001/student/today-attendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role,
          },
        });

        if (res.data.attendance) {
          const attendance = res.data.attendance;
          
          if (attendance.totalWorkingTime !== undefined) {
            setTotalWorkingTime(attendance.totalWorkingTime);
            const formattedTotal = formatTimeFromSeconds(attendance.totalWorkingTime);
            setWorkingHours(formattedTotal);
            setLiveWorkingTime(formattedTotal);
          }

          if (attendance.totalBreakTime !== undefined) {
            setBreakTime(attendance.totalBreakTime);
            setLiveBreakTime(formatTimeFromSeconds(attendance.totalBreakTime));
          }
          
          if (attendance.punchInTime) {
            setPunchInTime(attendance.punchInTime);
          }
          
          if (attendance.punchOutTime) {
            setPunchOutTime(attendance.punchOutTime);
            setIsPunchedIn(false);
            setIsOnBreak(true);
            setBreakStartTime(attendance.breakStartTime || attendance.punchOutTime);
          } else {
            setIsPunchedIn(true);
            setPunchOutTime(null);
            setIsOnBreak(false);
          }
        } else {
          resetDashboard();
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
        resetDashboard();
      }
    };

    loadTodayAttendance();
  }, []);

  const resetDashboard = () => {
    setPunchInTime(null);
    setPunchOutTime(null);
    setIsPunchedIn(false);
    setWorkingHours("00 Hr 00 Mins 00 Secs");
    setLiveWorkingTime("00 Hr 00 Mins 00 Secs");
    setBreakTime(0);
    setLiveBreakTime("00 Hr 00 Mins 00 Secs");
    setIsOnBreak(false);
    setBreakStartTime(null);
    setTotalWorkingTime(0);
  };

  useEffect(() => {
    if (!isOnBreak || !breakStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const breakStart = new Date(breakStartTime);
      const currentBreakSeconds = Math.floor((now - breakStart) / 1000);
      
      const totalBreakSeconds = breakTime + currentBreakSeconds;
      setLiveBreakTime(formatTimeFromSeconds(totalBreakSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnBreak, breakStartTime, breakTime]);

  useEffect(() => {
    if (!punchInTime || punchOutTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(punchInTime);
      const currentSessionSeconds = Math.floor((now - start) / 1000);
      const totalSeconds = totalWorkingTime + currentSessionSeconds;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setLiveWorkingTime(
        `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(2, "0")} Mins ${String(seconds).padStart(2, "0")} Secs`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [punchInTime, punchOutTime, totalWorkingTime]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error.message)
      );
    });
  };

  const formatTimeFromSeconds = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(2, "0")} Mins ${String(seconds).padStart(2, "0")} Secs`;
  };

  const handlePunchInClick = async () => {
    try {
      setLoading(true);
      setLocationStatus("Getting your location...");

      const loc = await getCurrentLocation();
      const distance = calculateDistance(
        loc.latitude,
        loc.longitude,
        INSTITUTION_LAT,
        INSTITUTION_LNG
      );

      setCurrentLocation(loc);
      setCurrentDistance(distance);
      setPendingAction('punchIn');
      setShowMap(true);
      setLoading(false);
    } catch (error) {
      alert("Failed to get location: " + error);
      setLocationStatus("❌ Location Error");
      setLoading(false);
    }
  };

  const handlePunchOutClick = async () => {
    if (!isPunchedIn) {
      alert("You must punch in first!");
      return;
    }

    try {
      setLoading(true);
      setLocationStatus("Getting your location...");

      const loc = await getCurrentLocation();
      const distance = calculateDistance(
        loc.latitude,
        loc.longitude,
        INSTITUTION_LAT,
        INSTITUTION_LNG
      );

      setCurrentLocation(loc);
      setCurrentDistance(distance);
      setPendingAction('punchOut');
      setShowMap(true);
      setLoading(false);
    } catch (error) {
      alert("Failed to get location: " + error);
      setLocationStatus("❌ Location Error");
      setLoading(false);
    }
  };

  const confirmPunchIn = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      setLoading(true);

      if (currentDistance > MAX_DISTANCE) {
        alert(`❌ Too far from institution (${Math.round(currentDistance)}m)`);
        setShowMap(false);
        setLoading(false);
        return;
      }

      let finalBreakTime = breakTime;
      if (isOnBreak && breakStartTime) {
        const now = new Date();
        const breakStart = new Date(breakStartTime);
        const currentBreakSeconds = Math.floor((now - breakStart) / 1000);
        finalBreakTime = breakTime + currentBreakSeconds;
      }

      const res = await axios.post(
        "http://localhost:3001/student/punch-in",
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          distance: currentDistance,
          totalBreakTime: finalBreakTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role,
          },
        }
      );

      setPunchInTime(res.data.attendance.punchInTime);
      setIsPunchedIn(true);
      setPunchOutTime(null);
      
      setIsOnBreak(false);
      setBreakStartTime(null);
      setBreakTime(finalBreakTime);
      setLiveBreakTime(formatTimeFromSeconds(finalBreakTime));
      
      setShowMap(false);
      alert("Punch In Successful! ✅");
      setLocationStatus(`✅ Punched in at ${Math.round(currentDistance)}m`);
    } catch (error) {
      alert(error?.response?.data?.message || "Punch In Failed");
      setLocationStatus("❌ Error");
    } finally {
      setLoading(false);
    }
  };

  const confirmPunchOut = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3001/student/punch-out",
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            role: role,
          },
        }
      );

      setPunchOutTime(res.data.attendance.punchOutTime);
      setIsPunchedIn(false);
      
      const newTotalWorkingTime = res.data.attendance.totalWorkingTime;
      setTotalWorkingTime(newTotalWorkingTime);
      
      const formattedTotal = formatTimeFromSeconds(newTotalWorkingTime);
      setWorkingHours(formattedTotal);
      setLiveWorkingTime(formattedTotal);
      
      setIsOnBreak(true);
      setBreakStartTime(res.data.attendance.breakStartTime || res.data.attendance.punchOutTime);
      
      setShowMap(false);
      setLocationStatus(`✅ Total: ${formattedTotal}`);
      alert(`Punch Out Successful! ✅\n\nTotal Working Hours: ${formattedTotal}`);
      
    } catch (error) {
      alert(error?.response?.data?.message || "Punch Out Failed");
      setLocationStatus("❌ Error");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#EEF6FB] p-4 sm:p-6">
      <SideBarStudent />

      <MapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        userLocation={currentLocation}
        institutionLocation={{ lat: INSTITUTION_LAT, lng: INSTITUTION_LNG }}
        distance={currentDistance}
        onConfirm={pendingAction === 'punchIn' ? confirmPunchIn : confirmPunchOut}
        isLoading={loading}
      />

      <div className="ml-0 lg:ml-56 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <StudentTopbar />
        </div>

        {locationStatus && (
          <div
            className={`mb-4 p-3 rounded-lg text-center font-semibold ${
              locationStatus.includes("✅")
                ? "bg-green-100 text-green-700"
                : locationStatus.includes("❌")
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {locationStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">On Time Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">65%</h2>
            <div className="h-10 rounded mt-4 bg-[#D1F7DC]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Late Percentage</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">35%</h2>
            <div className="h-10 rounded mt-4 bg-[#FDE2E2]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Total Break Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">
              {isOnBreak ? liveBreakTime : formatTimeFromSeconds(breakTime)}
            </h2>
            <div className="h-10 rounded mt-4 bg-[#FFE7D1]" />
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <p className="text-sm text-[#1679AB]">Total Working Hours</p>
            <h2 className="text-3xl font-bold text-[#141E46] mt-2">
              {isPunchedIn ? liveWorkingTime : workingHours}
            </h2>
            <div className="h-10 rounded mt-4 bg-[#D1E8FF]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hidden lg:block">
            <DashboardCalendar />
          </div>

          <div className="hidden lg:flex h-80 bg-blue-50 rounded-2xl shadow-2xl justify-center items-center">
            <LiveClockUpdate />
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <p className="text-sm text-[#1679AB]">Punch In Time</p>
                <p className="text-lg font-semibold text-[#141E46]">
                  {formatTime(punchInTime)}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <p className="text-sm text-[#1679AB]">Punch Out Time</p>
                <p className="text-lg font-semibold text-[#141E46]">
                  {formatTime(punchOutTime)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4">
              <p className="text-sm text-[#1679AB]">Today Break Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">
                {isOnBreak ? liveBreakTime : formatTimeFromSeconds(breakTime)}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-4">
              <p className="text-sm text-[#1679AB]">Today Working Hours</p>
              <p className="text-lg font-semibold text-[#141E46]">
                {isPunchedIn ? liveWorkingTime : workingHours}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <button
                onClick={handlePunchInClick}
                disabled={loading || isPunchedIn}
                className={`${
                  loading || isPunchedIn
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0dd635] hover:bg-[#0dd664]"
                } text-white py-3 rounded-lg font-semibold transition-colors`}
              >
                {loading && !isPunchedIn
                  ? "Getting Location..."
                  : isPunchedIn
                  ? "Already Punched In"
                  : "Punch In"}
              </button>

              <button
                onClick={handlePunchOutClick}
                disabled={loading || !isPunchedIn}
                className={`${
                  loading || !isPunchedIn
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#ed1717] hover:bg-[#d60d0de2]"
                } text-white py-3 rounded-lg font-semibold transition-colors`}
              >
                {loading && isPunchedIn ? "Getting Location..." : "Punch Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Studentsdashboard;