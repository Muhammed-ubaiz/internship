import { useState, useEffect } from "react";
import LiveClockUpdate from "../LiveClockUpdate";
import DashboardCalendar from "../Dashboardcalender";
import SideBarStudent from "./SideBarStudent";
import StudentTopbar from "./StudentTopbar";
import axios from "axios";
import { io } from "socket.io-client";

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

  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    if (!document.querySelector('link[href*="leaflet"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      css.crossOrigin = "";
      document.head.appendChild(css);
    }

    if (!document.querySelector('script[src*="leaflet"]')) {
      const js = document.createElement("script");
      js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      js.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      js.crossOrigin = "";
      js.onload = () => setMapLoaded(true);
      document.body.appendChild(js);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !mapLoaded || !userLocation) return;

    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      cleanupMap();
    };
  }, [isOpen, mapLoaded, userLocation?.latitude, userLocation?.longitude]);

  const initMap = () => {
    const mapContainer = document.getElementById('punchMap');
    if (!mapContainer || !window.L) return;

    if (mapInstance) mapInstance.remove();

    try {
      const map = window.L.map('punchMap', {
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
      }).setView([userLocation.latitude, userLocation.longitude], 17);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const userIcon = window.L.divIcon({
        html: `<div style="background:#1679AB;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">📍</div>`,
        className: 'custom-user-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = window.L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Your Location</b><br>Move to get accurate GPS')
        .openPopup();
      setUserMarker(marker);

      if (institutionLocation?.lat && institutionLocation?.lng) {
        const institutionIcon = window.L.divIcon({
          html: `<div style="background:#0dd635;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">🏫</div>`,
          className: 'custom-institution-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        window.L.marker([institutionLocation.lat, institutionLocation.lng], { icon: institutionIcon })
          .addTo(map)
          .bindPopup('<b>Institution</b><br>Destination location');

        window.L.circle([institutionLocation.lat, institutionLocation.lng], {
          radius: 100,
          color: distance <= 100 ? "#0dd635" : "#ed1717",
          fillColor: distance <= 100 ? "#0dd635" : "#ed1717",
          fillOpacity: 0.2,
          weight: 2,
          dashArray: distance <= 100 ? null : '5, 5'
        }).addTo(map);

        const line = window.L.polyline([
          [userLocation.latitude, userLocation.longitude],
          [institutionLocation.lat, institutionLocation.lng]
        ], {
          color: '#1679AB',
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 10'
        }).addTo(map);

        map._line = line;
      }

      setMapInstance(map);
      startGPSTracking(map, marker);

      setTimeout(() => map.invalidateSize(), 300);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const startGPSTracking = (map, marker) => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { latitude, longitude };
        setCurrentLocation(newLocation);

        marker.setLatLng([latitude, longitude]);

        if (map._line && institutionLocation?.lat && institutionLocation?.lng) {
          map._line.setLatLngs([[latitude, longitude], [institutionLocation.lat, institutionLocation.lng]]);
        }

        if (map._accuracyCircle) map.removeLayer(map._accuracyCircle);

        const accuracyCircle = window.L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#1679AB',
          fillColor: '#1679AB',
          fillOpacity: 0.1,
          weight: 1,
          dashArray: '5, 5'
        }).addTo(map);
        map._accuracyCircle = accuracyCircle;

        if (accuracy < 50) {
          map.setView([latitude, longitude], 17, { animate: true, duration: 1 });
        }

        marker.setPopupContent(`
          <b>Your Location</b><br>
          Accuracy: ${Math.round(accuracy)} meters<br>
          <small>${accuracy < 30 ? '✅ Good accuracy' : '⏳ Refining...'}</small>
        `);
      },
      (error) => console.error('GPS Error:', error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    map._gpsWatchId = watchId;
  };

  const cleanupMap = () => {
    if (mapInstance) {
      if (mapInstance._gpsWatchId) navigator.geolocation.clearWatch(mapInstance._gpsWatchId);
      mapInstance.remove();
      setMapInstance(null);
      setUserMarker(null);
    }
  };

  useEffect(() => {
    if (!mapInstance || !isOpen) return;
    const handleResize = () => setTimeout(() => mapInstance.invalidateSize(), 150);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapInstance, isOpen]);

  if (!isOpen) return null;

  const inRange = distance <= 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden animate-scaleIn">
        <div className="bg-gray-600 text-white px-4 py-2.5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Location Verification</h2>
            <p className="text-[11px] text-blue-100 opacity-80">First punch of the day - 50m range</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition text-sm">✕</button>
        </div>

        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">
              Distance: <span className="text-gray-900">{Math.round(distance)}m</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${inRange ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {inRange ? "In Range" : "Out of Range"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px]">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#1679AB]"></div><span className="text-gray-600">Your location</span></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#0dd635]"></div><span className="text-gray-600">Institution</span></div>
          </div>
        </div>

        <div className="relative">
          <div id="punchMap" className="h-[300px] w-full" />
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 rounded-full border-2 border-[#1679AB] border-t-transparent"></div>
            </div>
          )}
        </div>

        <div className="px-4 py-1.5 bg-blue-50 border-t">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${currentLocation ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-gray-700">{currentLocation ? 'GPS active' : 'GPS connecting...'}</span>
            </div>
            {!inRange && <span className="text-red-600 text-xs">⚠ Move closer</span>}
          </div>
        </div>

        <div className="px-4 py-2.5 flex gap-2">
          <button onClick={onClose} disabled={isLoading} className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-gray-700 text-sm">Cancel</button>
          <button
            onClick={() => onConfirm(currentLocation || userLocation)}
            disabled={!inRange || isLoading}
            className={`flex-1 py-2 rounded-lg font-medium text-white text-sm ${!inRange ? "bg-gray-300 text-gray-500" : "bg-gradient-to-r from-[#0dd635] to-[#0aa82a] hover:opacity-90"}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                Submitting...
              </span>
            ) : "Submit Request"}
          </button>
        </div>
      </div>

      <style>{`
        .animate-scaleIn { animation: scaleIn 0.15s ease-out; }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  );
}

function Studentsdashboard() {
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [workingHours, setWorkingHours] = useState("00 Hr 00 Mins 00 Secs");
  const [liveWorkingTime, setLiveWorkingTime] = useState("00 Hr 00 Mins 00 Secs");
  const [breakTime, setBreakTime] = useState(0);
  const [liveBreakTime, setLiveBreakTime] = useState("00 Hr 00 Mins 00 Secs");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [totalWorkingTime, setTotalWorkingTime] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingRequestId, setPendingRequestId] = useState(null);
  const [hasLocationCheckedToday, setHasLocationCheckedToday] = useState(false);
  const [attendance, setAttendance] = useState(null);
  
  const [gpsWatchId, setGpsWatchId] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [initialLocation, setInitialLocation] = useState(null);

  const INSTITUTION_LAT = 11.280610467307952;
  const INSTITUTION_LNG = 75.77045696982046;
  const MAX_DISTANCE = 50; // Auto punch-out if student moves 50m from initial location

  // ✅ SOCKET CONNECTION
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No token found");
      return;
    }

    const decoded = JSON.parse(atob(token.split(".")[1]));
    const studentId = decoded.id;
    console.log("👤 Student ID:", studentId);

    const newSocket = io("http://localhost:3001", {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("joinStudentRoom", studentId);
      console.log("👨‍🎓 Joined student room:", studentId);
      setLocationStatus("");
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
      setLocationStatus("❌ Connection failed");
    });

    // ✅ APPROVAL EVENT
    newSocket.on("requestApproved", (data) => {
      console.log("🔥 Approval received:", data);
      console.log("📍 Comparing IDs:", {
        received: data.studentId,
        current: studentId,
        match: String(data.studentId) === String(studentId)
      });

      if (String(data.studentId) !== String(studentId)) {
        console.log("⚠️ Not for this student, ignoring");
        return;
      }

      if (data.type === "PUNCH_IN") {
        console.log("✅ Processing PUNCH_IN approval");
        
        setPendingRequestId(null);
        setPendingAction(null);
        setIsPunchedIn(true);
        setPunchInTime(new Date(data.punchTime));
        setPunchOutTime(null);
        setIsOnBreak(false);
        setBreakStartTime(null);
        setHasLocationCheckedToday(true);
        setLocationStatus("✅ Punch-in approved - GPS tracking active");

        startLocationTracking();
        
        setTimeout(() => {
          loadTodayAttendance();
        }, 500);
      }

      if (data.type === "PUNCH_OUT") {
        console.log("✅ Processing PUNCH_OUT approval");
        
        setIsPunchedIn(false);
        setPunchOutTime(new Date(data.punchTime));
        setIsOnBreak(true);
        setBreakStartTime(new Date());
        setLocationStatus("✅ Punch-out approved");

        stopLocationTracking();
        
        setTimeout(() => {
          loadTodayAttendance();
        }, 500);
      }
    });

    newSocket.on("autoPunchOut", (data) => {
      console.log("⚠️ Auto punch-out received:", data);

      setIsPunchedIn(false);
      setPunchOutTime(new Date());
      setIsOnBreak(true);
      setBreakStartTime(new Date());
      setLocationStatus(`⚠️ Auto punch-out: ${Math.round(data.distance)}m from institution`);

      stopLocationTracking();
      
      setTimeout(() => {
        loadTodayAttendance();
      }, 500);
    });

    setSocket(newSocket);

    return () => {
      console.log("🔌 Disconnecting socket");
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const res = await axios.get("http://localhost:3001/student/today-attendance", {
        headers: { 
          Authorization: `Bearer ${token}`,
          Role: role,
        },
      });

      const att = res.data.attendance;

      if (!att) {
        resetDashboard();
        return;
      }

      setAttendance(att);
      setHasLocationCheckedToday(att.initialLocationChecked);

      // Store initial location for auto punch-out tracking
      if (att.initialLatitude && att.initialLongitude) {
        setInitialLocation({
          latitude: att.initialLatitude,
          longitude: att.initialLongitude
        });
      }

      setTotalWorkingTime(att.totalWorkingSeconds || 0);
      setWorkingHours(formatTimeFromSeconds(att.totalWorkingSeconds || 0));
      setLiveWorkingTime(formatTimeFromSeconds(att.totalWorkingSeconds || 0));

      setBreakTime(att.totalBreakSeconds || 0);
      setLiveBreakTime(formatTimeFromSeconds(att.totalBreakSeconds || 0));

      let lastRecord = null;
      if (att.punchRecords && att.punchRecords.length > 0) {
        lastRecord = att.punchRecords[att.punchRecords.length - 1];
      }

      if (lastRecord && !lastRecord.punchOut) {
        setIsPunchedIn(true);
        setPunchInTime(new Date(lastRecord.punchIn));
        setIsOnBreak(false);
        setBreakStartTime(null);
      } else {
        setIsPunchedIn(false);
        setPunchInTime(lastRecord ? new Date(lastRecord.punchIn) : null);
        setIsOnBreak(!!att.currentBreakStart);
        setBreakStartTime(att.currentBreakStart ? new Date(att.currentBreakStart) : null);
      }

      setPunchOutTime(lastRecord?.punchOut ? new Date(lastRecord.punchOut) : null);
    } catch (error) {
      console.error("Error loading attendance:", error);
      resetDashboard();
    }
  };

  const resetDashboard = () => {
    setHasLocationCheckedToday(false);
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
    const interval = setInterval(() => {
      const now = Date.now();

      if (isPunchedIn && punchInTime) {
        const extraMs = now - punchInTime.getTime();
        const liveTotal = totalWorkingTime + Math.floor(extraMs / 1000);
        setLiveWorkingTime(formatTimeFromSeconds(liveTotal));
      } else {
        setLiveWorkingTime(formatTimeFromSeconds(totalWorkingTime));
      }

      if (isOnBreak && breakStartTime) {
        const extraBreakMs = now - breakStartTime.getTime();
        const liveBreak = breakTime + Math.floor(extraBreakMs / 1000);
        setLiveBreakTime(formatTimeFromSeconds(liveBreak));
      } else {
        setLiveBreakTime(formatTimeFromSeconds(breakTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPunchedIn, punchInTime, totalWorkingTime, isOnBreak, breakStartTime, breakTime]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        reject,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    // Use initial punch-in location if available, otherwise use institution location
    const trackingLat = initialLocation?.latitude || attendance?.initialLatitude || INSTITUTION_LAT;
    const trackingLng = initialLocation?.longitude || attendance?.initialLongitude || INSTITUTION_LNG;

    console.log("🌍 Starting GPS tracking for auto punch-out...");
    console.log(`📍 Tracking from: ${trackingLat}, ${trackingLng}`);
    setIsTrackingLocation(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, trackingLat, trackingLng);

        console.log(`📍 Current distance from initial location: ${Math.round(distance)}m`);

        if (distance > MAX_DISTANCE && isPunchedIn) {
          console.warn(`⚠️ Distance exceeded: ${Math.round(distance)}m > ${MAX_DISTANCE}m - Triggering auto punch-out`);
          handleAutoPunchOut(latitude, longitude, distance);
        }
      },
      (error) => {
        console.error("GPS tracking error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    setGpsWatchId(watchId);
  };

  const stopLocationTracking = () => {
    if (gpsWatchId !== null) {
      navigator.geolocation.clearWatch(gpsWatchId);
      setGpsWatchId(null);
      setIsTrackingLocation(false);
      console.log("🛑 GPS tracking stopped");
    }
  };

  const handleAutoPunchOut = async (latitude, longitude, distance) => {
    try {
      console.log("⚠️ Triggering auto punch-out...");
      
      const token = localStorage.getItem('token');
      const res = await axios.post(
        "http://localhost:3001/student/auto-punch-out",
        { latitude, longitude, distance },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setIsPunchedIn(false);
        setPunchOutTime(new Date());
        setIsOnBreak(true);
        setBreakStartTime(new Date());
        setLocationStatus(`⚠️ Auto punch-out: Distance exceeded (${Math.round(distance)}m)`);
        stopLocationTracking();
        loadTodayAttendance();
      }
    } catch (error) {
      console.error("Auto punch-out error:", error);
    }
  };

  useEffect(() => {
    if (isPunchedIn && !isTrackingLocation && (initialLocation || attendance?.initialLatitude)) {
      startLocationTracking();
    } else if (!isPunchedIn && isTrackingLocation) {
      stopLocationTracking();
    }

    return () => {
      if (isTrackingLocation) {
        stopLocationTracking();
      }
    };
  }, [isPunchedIn, initialLocation]);

  const handlePunchInClick = async () => {
    if (isPunchedIn || loading) return;

    try {
      setLoading(true);
      setLocationStatus("Getting your location...");

      if (!hasLocationCheckedToday) {
        const loc = await getCurrentLocation();
        const dist = calculateDistance(loc.latitude, loc.longitude, INSTITUTION_LAT, INSTITUTION_LNG);
        setCurrentLocation(loc);
        setCurrentDistance(dist);
        setPendingAction('punchIn');
        setShowMap(true);
        setLoading(false);
      } 
      else {
        const res = await axios.post("http://localhost:3001/student/punch-in", {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.data.success) {
          setIsPunchedIn(true);
          setPunchInTime(new Date());
          setPunchOutTime(null);
          setIsOnBreak(false);
          setBreakStartTime(null);
          setBreakTime(res.data.attendance.totalBreakSeconds);
          setTotalWorkingTime(res.data.attendance.totalWorkingSeconds);
          setLocationStatus("✅ Punched in - GPS tracking active");
          startLocationTracking();
          loadTodayAttendance();
        }
        setLoading(false);
      }
    } catch (error) {
      setLocationStatus("❌ Error: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const confirmPunchIn = async () => {
    if (!currentLocation?.latitude || !currentLocation?.longitude) {
      alert("📍 Fetching location, please wait...");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3001/student/request-punch-in",
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          distance: currentDistance || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.message === 'Punch-in request submitted successfully') {
        setPendingRequestId(res.data.requestId);
        setPendingAction('punchIn');
        setLocationStatus("⏳ First punch-in request submitted - Waiting for admin approval");
        setShowMap(false);
        setHasLocationCheckedToday(true);
      }
    } catch (err) {
      console.error("Punch-in request error:", err.response?.data);
      alert(err.response?.data?.message || "Punch-in request failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOutClick = async () => {
    if (!isPunchedIn || loading) return;

    try {
      setLoading(true);
      setLocationStatus("Processing punch-out...");
      
      const token = localStorage.getItem('token');
      const res = await axios.post(
        "http://localhost:3001/student/punch-out", 
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setIsPunchedIn(false);
        setPunchOutTime(new Date());
        setIsOnBreak(true);
        setBreakStartTime(new Date());
        
        if (res.data.attendance) {
          setBreakTime(res.data.attendance.totalBreakSeconds || 0);
          setTotalWorkingTime(res.data.attendance.totalWorkingSeconds || 0);
          setWorkingHours(formatTimeFromSeconds(res.data.attendance.totalWorkingSeconds || 0));
        }
        
        setLocationStatus("✅ Punched out - Break started");
        stopLocationTracking();
        
        setTimeout(() => {
          loadTodayAttendance();
        }, 500);
      }
    } catch (error) {
      console.error("❌ Punch-out error:", error);
      setLocationStatus("❌ Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatTimeFromSeconds = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")} Hr ${String(minutes).padStart(2, "0")} Mins ${String(seconds).padStart(2, "0")} Secs`;
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    return new Date(time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
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
        onConfirm={confirmPunchIn}
        isLoading={loading}
      />

      <div className="ml-0 lg:ml-56 max-w-6xl mx-auto">
        <div className="flex justify-center items-center mb-10">
          <StudentTopbar />
        </div>

        {locationStatus && (
          <div
            className={`mb-4 p-3 rounded-lg text-center font-semibold ${
              locationStatus.includes("✅") ? "bg-green-100 text-green-700" :
              locationStatus.includes("❌") ? "bg-red-100 text-red-700" :
              locationStatus.includes("⚠️") ? "bg-orange-100 text-orange-700" :
              locationStatus.includes("⏳") ? "bg-yellow-100 text-yellow-700" :
              "bg-blue-100 text-blue-700"
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
                disabled={loading || isPunchedIn || pendingRequestId}
                className={`py-3 rounded-lg font-semibold text-white transition-colors ${
                  loading || isPunchedIn || pendingRequestId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0dd635] hover:bg-[#0dd664]"
                }`}
              >
                {pendingRequestId && pendingAction === 'punchIn'
                  ? "⏳ Waiting Admin Approval..."
                  : loading
                  ? "Getting Location..."
                  : isPunchedIn
                  ? "Already Punched In"
                  : hasLocationCheckedToday
                  ? "Punch In"
                  : "First Punch In (Approval Required)"}
              </button>

              <button
                onClick={handlePunchOutClick}
                disabled={loading || !isPunchedIn || (pendingRequestId && pendingAction === 'punchIn')}
                className={`py-3 rounded-lg font-semibold text-white transition-colors ${
                  loading || !isPunchedIn || (pendingRequestId && pendingAction === 'punchIn')
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#ed1717] hover:bg-[#d60d0de2]"
                }`}
              >
                {pendingRequestId && pendingAction === 'punchIn'
                  ? "⏳ Approve Punch-in First"
                  : loading
                  ? "Processing..."
                  : !isPunchedIn
                  ? "Punch In First"
                  : "Punch Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Studentsdashboard;