import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./sidebar";

function Announcement() {
  // 🧠 STATES
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [batch, setBatch] = useState("All");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(true);
  const [error, setError] = useState(null);

  // 📦 FETCH BATCHES
  const fetchBatches = async () => {
    try {
      setFetchingBatches(true);
      setError(null);

      // Get fresh token each time
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please login again");
        setBatches([]);
        return;
      }

      const res = await axios.get(
        "http://localhost:3001/mentor/getbatch",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ FULL RESPONSE:", res.data);

      const apiBatches =
        res.data?.batches ||
        res.data?.data ||
        [];

      setBatches(apiBatches);

    } catch (err) {
      console.error(
        "❌ Batch fetch error:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to load batches"
      );
      setBatches([]);
    } finally {
      setFetchingBatches(false);
    }
  };

  // 🔁 USE EFFECT
  useEffect(() => {
    fetchBatches();
    // eslint-disable-next-line
  }, []);

  // 📤 SEND ANNOUNCEMENT
  const handleSend = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert("Title and message are required");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login again");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:3001/mentor/announcementsend",
        {
          title: title.trim(),
          message: message.trim(),
          batch,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Announcement sent successfully");

      // RESET
      setTitle("");
      setMessage("");
      setBatch("All");

    } catch (err) {
      console.error("❌ Send error:", err.response?.data || err.message);
      alert(
        err.response?.data?.message ||
          "Failed to send announcement"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🖥️ UI
  return (
    <div className="min-h-screen bg-[#EEF6FB] flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 md:ml-56 w-full">
        <div className="bg-white max-w-xl mx-auto p-4 sm:p-6 rounded-xl shadow w-full">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
            📢 Send Announcement
          </h2>

          {/* ERROR */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            {/* BATCH */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Batch
              </label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                disabled={fetchingBatches}
                className="w-full border p-2 sm:p-3 rounded-lg text-sm sm:text-base"
              >
                <option value="All">All</option>

                {!fetchingBatches &&
                  batches.map((b, i) => (
                    <option key={i} value={b}>
                      {b}
                    </option>
                  ))}
              </select>

              <p className="text-xs text-gray-500 mt-1">
                {fetchingBatches
                  ? "Loading batches..."
                  : batches.length === 0
                  ? "No batches assigned"
                  : `${batches.length} batch(es) available`}
              </p>
            </div>

            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 sm:p-3 rounded-lg text-sm sm:text-base"
                placeholder="Announcement title"
                maxLength={100}
                required
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border p-2 sm:p-3 rounded-lg resize-none text-sm sm:text-base"
                rows={4}
                placeholder="Write announcement..."
                maxLength={500}
                required
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading || fetchingBatches}
              className="w-full bg-[#141E46] text-white py-2 sm:py-3 rounded-lg hover:bg-[#1c285f] transition disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? "Sending..." : "Send Announcement"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Announcement;
